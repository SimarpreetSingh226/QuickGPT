import React from "react";
import { assets } from "../assets/assets";

const Message = ({ message }) => {
  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-4 gap-2">
          <div className="flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317c]/30 border border-[#80609f]/30 rounded-md max-w-2xl ">
            <p className="text-sm dark:text-primary">{message.Content}</p>
            <span className="text-xs text-gray-500 dark:text-[#b1a6c0]">
              {message.timestamp}
            </span>
          </div>
          <img src={assets.user_icon} className="w-8 rounded-full" alt="" />
        </div>
      ) : (
        <div>
          {message.isImage ? (
            <img
              src={message.Content}
              className="w-full max-w-md mt-2 rounded-md"
            />
          ) : (
            <div>{message.Content}</div>
          )}
        </div>
      )}
      <span>{message.timestamp}</span>
    </div>
  );
};

export default Message;
