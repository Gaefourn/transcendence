import React, {CSSProperties} from "react";
import {Message} from 'store/types/channel';
import {useGetUserByIdQuery} from 'store/api';
import Avatars from 'components/Avatars';

const styles : Record<string, CSSProperties> = {
  main: {
    display: "flex",
    flexDirection: "row",
    color: "white",
    padding : "8px",
    marginLeft: "16px",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: 0,
    justifyContent: "flex-start",
    display: "flex",
    alignItems: "center"
  },
  title: {
    padding: "0 8px",
    fontSize : "16px",
    fontWeight: 'bold'
  },
  system: {
    fontSize: "16px",
    paddingRight: 8,
  },
  date: {
    fontSize: "12px",
    color: "#c4c4c4",
  },
  img: {
    height: 50,
    width: 50,
    maxWidth: "100%",
    maxHeight: "auto",
    borderRadius: 25,
  },
  message: {
    padding: "8px 0 0 12px",
    wordBreak: "break-word",
    whiteSpace: 'pre-line',
  },
};

type MessageProps = {
  message: Message;
  sender?: string;
};

type UserPostProps = {
  content: string;
  sender: string;
  time: string;
}

const sameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() &&
  d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();

const UserPost: React.FC<UserPostProps> = ({ content, time, sender}) => {
  const { data: user } = useGetUserByIdQuery(sender);

  return <>
    {user && <Avatars id={user.avatar_id} />}
    <div style={styles.content}>
      <div style={styles.header}>
        { user?.username && <div style={styles.title}>{ user.username }</div> }
        <div style={styles.date}>{ time }</div>
      </div>
      <div style={styles.message}>{ content }</div>
    </div>
  </>
}

const SystemPost: React.FC<{ content: string, time: string}> = ({ content, time }) => {
  return <div style={styles.header}>
    <div style={styles.system}>{ content }</div>
    <div style={styles.date}>{ time }</div>
  </div>
}

const Post: React.FC<MessageProps> = ({ message, sender }) => {
  const { content, createdAt: src } = message;
  const now = new Date();
  const msg = new Date(src);

  let format = sameDay(now, msg) ?
    "Today at " + msg.toLocaleTimeString("en-EN", {
      second: undefined,
      hour12: false
    }).split(":").splice(0, 2).join(":") :
    msg.toLocaleDateString("en-EN", {
      day: "2-digit",
      month: "2-digit",
      year: 'numeric'
    }).split(" ").join("/");

  return (
    <div style={styles.main}>
      {sender ?
      <UserPost content={content} time={format} sender={sender} /> :
      <SystemPost content={content} time={format} />
      }
    </div>
  );
}

export default Post;
