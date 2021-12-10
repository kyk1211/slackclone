import { IChat, IDM } from '@typings/db';
import React, { VFC, memo, useMemo } from 'react';
import { ChatWrapper } from './styles';
import gravartar from 'gravatar';
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';
import { Link, useParams } from 'react-router-dom';

interface Props {
  data: IDM | IChat;
}
const BACK_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3095' : '배포주소';
const Chat: VFC<Props> = ({ data }) => {
  const { workspace } = useParams<{ workspace: string }>();
  const user = 'Sender' in data ? data.Sender : data.User;

  const result = useMemo(
    () =>
      data.content.startsWith('upload\\') ? (
        <img src={`${BACK_URL}/${data.content}`} style={{ maxHeight: 200 }} />
      ) : (
        regexifyString({
          input: data.content,
          pattern: /@\[(.+?)\]\((\d+?)\)|\n/g,
          decorator(match, index) {
            const arr: string[] | null = match.match(/@\[(.+?)\]\((\d+?)\)/)!;
            if (arr) {
              return (
                <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
                  @{arr[1]}
                </Link>
              );
            }
            return <br key={index} />;
          },
        })
      ),
    [data.content],
  );

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravartar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span> {dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
};

export default memo(Chat);
