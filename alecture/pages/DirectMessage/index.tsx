import React from 'react';
import { Container, Header } from './styles';
import gravartar from 'gravatar'
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string, id: string }>();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher,);
  const { data: myData } = useSWR(`/api/users`, fetcher,);

  if (!userData || !myData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <img src={gravartar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      {/* <ChatList />
      <ChatBox /> */}
    </Container>
  );
};

export default DirectMessage;