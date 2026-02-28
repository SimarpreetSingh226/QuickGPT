import React, { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";

const ChatBox = () => {
  const { selectedchat, theme } = useAppContext();
  const [messages, setMessages] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedchat) {
      setMessages(selectedchat.messages);
    }
  }, [selectedchat]);
  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* chat Message */}
      <div className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              alt=""
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400">
              Ask me anything
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>
      <form action=""></form>
    </div>
  );
};

export default ChatBox;
