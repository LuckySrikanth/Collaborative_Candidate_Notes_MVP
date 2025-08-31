import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getCandidates, createCandidate } from "../api";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { useSocket } from "../hooks/useSocket";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [globalNotifications, setGlobalNotifications] = useState([]);

  const fetchCandidates = useCallback(async () => {
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates.");
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // 🔌 Connect socket and listen for messages & tagged notifications
  const candidateId = candidates[0]?._id || null; // can join first candidate room
  const { sendMessage } = useSocket(
    candidateId,
    (newMessage) => {
      // optional: update messages per candidate if needed
      console.log("Received new candidate message:", newMessage);
    },
    (notif) => {
      // tagged notification handler
      setGlobalNotifications((prev) => [
        {
          id: notif.message._id,
          candidateId: notif.candidateId,
          candidateName: notif.message.candidate?.name || "Candidate",
          messagePreview: notif.message.body?.slice(0, 100) || "",
          taggedBy: notif.message.sender?.name || "Someone",
        },
        ...prev,
      ]);
    }
  );

  console.log(globalNotifications, "globalNotifications");

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidateName || !newCandidateEmail) {
      toast.error("Candidate name and email are required.");
      return;
    }
    try {
      const newCandidate = await createCandidate(
        newCandidateName,
        newCandidateEmail
      );
      setCandidates([...candidates, newCandidate]);
      setNewCandidateName("");
      setNewCandidateEmail("");
      toast.success(`Candidate "${newCandidate.name}" created.`);
    } catch (error) {
      console.error("Error creating candidate:", error);
      toast.error("Failed to create candidate.");
    }
  };

  const handleNotificationClick = (notification) => {
    navigate(`/candidate/${notification.candidateId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.username}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidates Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Candidates</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Candidate</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Candidate</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleCreateCandidate}
                  className="grid gap-4 py-4"
                >
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newCandidateName}
                      onChange={(e) => setNewCandidateName(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCandidateEmail}
                      onChange={(e) => setNewCandidateEmail(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Candidate</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <p className="text-gray-500">No candidates yet. Add one!</p>
            ) : (
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <ul className="space-y-2">
                  {candidates.map((candidate) => (
                    <li
                      key={candidate._id}
                      className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/candidate/${candidate._id}`)}
                    >
                      <div>
                        <p className="font-semibold">{candidate.name}</p>
                        <p className="text-sm text-gray-500">
                          {candidate.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:text-white"
                      >
                        View Notes
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Global Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Your Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {globalNotifications.length === 0 ? (
              <p className="text-gray-500">No new notifications.</p>
            ) : (
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <ul className="space-y-2">
                  {globalNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p className="font-semibold">
                        {notification.candidateName}
                      </p>
                      <p className="text-sm text-gray-700 truncate">
                        {notification.messagePreview}
                      </p>
                      {/* <p className="text-xs text-gray-400">
                        Tagged by {notification.taggedBy}
                      </p> */}
                      <p>{notification.candidateId}</p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

// import React, { useEffect, useState, useCallback } from "react";
// import { useAuth } from "../context/AuthContext";
// import { getCandidates, createCandidate } from "../api";
// import { useNavigate } from "react-router-dom";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardFooter,
// } from "./ui/card";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
// } from "./ui/dialog";
// import { toast } from "sonner";
// import { ScrollArea } from "./ui/scroll-area";
// import { useSocket } from "../hooks/useSocket";

// const Dashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [candidates, setCandidates] = useState([]);
//   const [newCandidateName, setNewCandidateName] = useState("");
//   const [newCandidateEmail, setNewCandidateEmail] = useState("");
//   const [globalNotifications, setGlobalNotifications] = useState([]);

//   const fetchCandidates = useCallback(async () => {
//     try {
//       const data = await getCandidates();
//       setCandidates(data);
//     } catch (error) {
//       console.error("Error fetching candidates:", error);
//       toast.error("Failed to load candidates.");
//     }
//   }, []);

//   useEffect(() => {
//     fetchCandidates();
//   }, [fetchCandidates]);

//   // 🔌 Connect socket and listen for messages & tagged notifications
//   const candidateId = candidates[0]?._id || null; // can join first candidate room
//   const { sendMessage } = useSocket(
//     candidateId,
//     (newMessage) => {
//       // optional: update messages per candidate if needed
//     },
//     (notif) => {
//       // tagged notification handler
//       setGlobalNotifications((prev) => [
//         {
//           id: notif.message._id,
//           candidateId: notif.candidateId,
//           candidateName: notif.message.candidate?.name || "Candidate",
//           messagePreview: notif.message.body?.slice(0, 100) || "",
//           taggedBy: notif.message.sender?.name || "Someone",
//         },
//         ...prev,
//       ]);
//     }
//   );

//   const handleCreateCandidate = async (e) => {
//     e.preventDefault();
//     if (!newCandidateName || !newCandidateEmail) {
//       toast.error("Candidate name and email are required.");
//       return;
//     }
//     try {
//       const newCandidate = await createCandidate(
//         newCandidateName,
//         newCandidateEmail
//       );
//       setCandidates([...candidates, newCandidate]);
//       setNewCandidateName("");
//       setNewCandidateEmail("");
//       toast.success(`Candidate "${newCandidate.name}" created.`);
//     } catch (error) {
//       console.error("Error creating candidate:", error);
//       toast.error("Failed to create candidate.");
//     }
//   };

//   const handleNotificationClick = (notification) => {
//     navigate(`/candidate/${notification.candidateId}`);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-6">Welcome, {user?.username}!</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Candidates Section */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-2xl font-bold">Candidates</CardTitle>
//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button>Add Candidate</Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Create New Candidate</DialogTitle>
//                 </DialogHeader>
//                 <form
//                   onSubmit={handleCreateCandidate}
//                   className="grid gap-4 py-4"
//                 >
//                   <div classNa me="grid grid-cols-4 items-center gap-4">
//                     <Label htmlFor="name" className="text-right">
//                       Name
//                     </Label>
//                     <Input
//                       id="name"
//                       value={newCandidateName}
//                       onChange={(e) => setNewCandidateName(e.target.value)}
//                       className="col-span-3"
//                       required
//                     />
//                   </div>
//                   <div className="grid grid-cols-4 items-center gap-4">
//                     <Label htmlFor="email" className="text-right">
//                       Email
//                     </Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={newCandidateEmail}
//                       onChange={(e) => setNewCandidateEmail(e.target.value)}
//                       className="col-span-3"
//                       required
//                     />
//                   </div>
//                   <DialogFooter>
//                     <Button type="submit">Create Candidate</Button>
//                   </DialogFooter>
//                 </form>
//               </DialogContent>
//             </Dialog>
//           </CardHeader>
//           <CardContent>
//             {candidates.length === 0 ? (
//               <p className="text-gray-500">No candidates yet. Add one!</p>
//             ) : (
//               <ScrollArea className="h-[300px] w-full rounded-md border p-4">
//                 <ul className="space-y-2">
//                   {candidates.map((candidate) => (
//                     <li
//                       key={candidate._id}
//                       className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
//                       onClick={() => navigate(`/candidate/${candidate._id}`)}
//                     >
//                       <div>
//                         <p className="font-semibold">{candidate.name}</p>
//                         <p className="text-sm text-gray-500">
//                           {candidate.email}
//                         </p>
//                       </div>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-white hover:text-white"
//                       >
//                         View Notes
//                       </Button>
//                     </li>
//                   ))}
//                 </ul>
//               </ScrollArea>
//             )}
//           </CardContent>
//         </Card>

//         {/* Global Notifications Card */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold">
//               Your Notifications
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {globalNotifications.length === 0 ? (
//               <p className="text-gray-500">No new notifications.</p>
//             ) : (
//               <ScrollArea className="h-[300px] w-full rounded-md border p-4">
//                 <ul className="space-y-2">
//                   {globalNotifications.map((notification) => (
//                     <li
//                       key={notification.id}
//                       className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
//                       onClick={() => handleNotificationClick(notification)}
//                     >
//                       <p className="font-semibold">
//                         {notification.candidateName}
//                       </p>
//                       <p className="text-sm text-gray-700 truncate">
//                         {notification.messagePreview}
//                       </p>
//                       <p className="text-xs text-gray-400">
//                         Tagged by {notification.taggedBy}
//                       </p>
//                     </li>
//                   ))}
//                 </ul>
//               </ScrollArea>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
