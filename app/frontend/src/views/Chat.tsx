import React, {CSSProperties, useEffect, useState} from 'react';
import Post from 'components/Post';
import {styled, TextField} from '@mui/material';

import {useAppDispatch, useAppSelector} from 'store';
import {message, MessageKind} from 'store/chatSocket';
import {useGetBlockedQuery, useGetMeQuery} from 'store/api';
import {User} from 'store/types/user';

const styles: Record<string, CSSProperties> = {
  main: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden"
  },
  messages: {
    display: 'flex',
    overflow: "auto",
    flex: 1,
    flexDirection: "column-reverse",
    alignItems: "stretch",
  },
};

type Props = {
  style: React.CSSProperties,
  channel: string,
  is_dm: boolean,
  muted: boolean
}

const MessageField = styled(TextField)(theme => ({
  '&': {
    borderRadius: '8px',
    backgroundColor: "#36393F",
    flexShrink: 0,
    width: "98%",
    alignSelf: "center",
    marginBottom: "15px",
  },
  '& > .MuiInputBase-root': {
    borderRadius: '8px',
  }
}));

const Chat: React.FC<Props> = ({ style, channel, is_dm, muted }) => {
  const { data: user } = useGetMeQuery();
  const { data: blocked = [] } = useGetBlockedQuery();
  const messages = useAppSelector(state => state.chat.messages[channel] || []);
  const [content, setContent] = useState("");
  const dispatch = useAppDispatch();

  const validate = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey)
      {
        setContent(content + '\n');
        return ;
      }
      let msg = content.trim();
      if (!e.currentTarget.textContent || !msg || !user)
        return ;
      dispatch(message({
        room: channel,
        kind: is_dm ? MessageKind.Dm : MessageKind.Channel,
        message: msg
      }));
      setContent("");
    }
  };

  useEffect(() => {
    if (content.length > 256)
      setContent(content.slice(0, 256));
  }, [content,setContent]);

  return (
    <div style={{...style, ...styles.main}}>
      <div style={styles.messages}>
        {[...messages]
          .filter(e => blocked.indexOf(e.sender) === -1)
          .reverse().map(e => <Post
          message={e}
          sender={e.sender}
          key={e.createdAt} />)}
      </div>
      <MessageField
        sx={{ fontStyle: muted ? "italic" : "inherit"}}
        placeholder={muted ? "You are not allowed to send messages in this channel" : "Send a message"}
        maxRows={16}
        disabled={muted}
        onKeyPress={validate}
        value={content}
        onChange={(e) => setContent(e.currentTarget.value)}
        multiline>
      </MessageField>
    </div>
  );
};

export default Chat
