import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCandidateNotes } from "../api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const CandidateNotes = () => {
  const { id: __id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [candidate, setCandidate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [taggingUsers, setTaggingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewMessage = useCallback((newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const handleUserTagged = useCallback(
    (notification) => {
      toast({
        title: "New Tag!",
        description: `You were tagged in a note for ${notification.candidateName}: "${notification.messagePreview}"`,
      });
    },
    [toast]
  );

  const { isConnected, sendMessage } = useSocket(
    __id,
    handleNewMessage,
    handleUserTagged
  );

  // Fetch candidate notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getCandidateNotes(__id);

        if (data.length > 0) {
          const firstNote = data[0];
          setCandidate({
            _id: firstNote.candidate,
            name: firstNote.sender?.username || "Unknown",
            email: firstNote.sender?.email || "N/A",
          });
        } else {
          setCandidate({ _id: __id, name: "Unknown", email: "N/A" });
        }

        setMessages(data);
      } catch (error) {
        console.error("Error fetching candidate notes:", error);
        toast({
          title: "Error",
          description: "Failed to load candidate notes.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    fetchNotes();
  }, [__id, navigate, toast]);

  // Auto-scroll on messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && isConnected) {
      sendMessage(messageInput);
      setMessageInput("");
      setTaggingUsers([]);
    }
  };

  const handleMessageInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    const lastWord = value.split(" ").pop();
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      const searchTerm = lastWord.substring(1).toLowerCase();
      const filteredUsers = availableUsers.filter((u) =>
        u.username.toLowerCase().includes(searchTerm)
      );
      setTaggingUsers(filteredUsers);
    } else {
      setTaggingUsers([]);
    }
  };

  const handleTagUser = (taggedUser) => {
    const lastAtIndex = messageInput.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const newMessageInput =
        messageInput.substring(0, lastAtIndex) + `@${taggedUser.username} `;
      setMessageInput(newMessageInput);
      setTaggingUsers([]);
    }
  };

  if (!candidate) return <div>Loading candidate notes...</div>;

  return (
    <div className="p-2 sm:p-6 h-screen flex flex-col">
      <Button
        variant="outline"
        className="mb-2 sm:mb-4 self-start text-white bg-white px-2 hover:text-white"
        onClick={() => navigate("/")}
      >
        &larr; Back to Dashboard
      </Button>

      <Card className="flex flex-col flex-grow overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {candidate.name}'s Notes
          </CardTitle>
          <p className="text-sm text-gray-500">{candidate.email}</p>
          {!isConnected && (
            <div className="text-red-500 text-sm mt-1 sm:mt-2">
              Disconnected from real-time updates. Please refresh.
            </div>
          )}
        </CardHeader>

        {/* Chat messages container */}
        <CardContent className="flex flex-col flex-grow p-0 overflow-hidden">
          <ScrollArea className="flex-grow w-full px-2 sm:px-4 py-2 sm:py-3 overflow-y-auto">
            <div className="flex flex-col space-y-2 sm:space-y-4">
              {messages.map((msg, index) => {
                const senderName =
                  msg.sender.username || msg.sender.email || "Unknown";
                const isCurrentUser = senderName === user.username;

                return (
                  <div
                    key={msg._id || index}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 ${
                        isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${senderName}`}
                        />
                        <AvatarFallback>
                          {senderName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`break-words max-w-full sm:max-w-[70%] p-3 rounded-lg ${
                          isCurrentUser
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="font-semibold text-sm mb-1">
                          {isCurrentUser ? "You" : senderName}
                        </p>
                        <p className="text-sm">{msg.body}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input/footer sticky at bottom */}
        <CardFooter className="p-2 sm:p-4 border-t flex-shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="flex flex-col sm:flex-row w-full sm:space-x-2 gap-2"
          >
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Type your message here..."
                value={messageInput}
                onChange={handleMessageInputChange}
                className="w-full pr-10"
              />
              {taggingUsers.length > 0 && (
                <DropdownMenu open={taggingUsers.length > 0}>
                  <DropdownMenuTrigger asChild>
                    <div className="absolute inset-y-0 right-0 w-10 cursor-pointer opacity-0" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 absolute bottom-full left-0 mb-2">
                    {taggingUsers.map((u) => (
                      <DropdownMenuItem
                        key={u._id}
                        onClick={() => handleTagUser(u)}
                      >
                        @{u.username}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <Button
              type="submit"
              disabled={!messageInput.trim() || !isConnected}
            >
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CandidateNotes;
