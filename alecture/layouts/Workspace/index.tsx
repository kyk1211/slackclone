import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState, VFC } from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router';
import useSWR from 'swr';
import { AddButton, Channels, Chats, Header, LogOutButton, MenuScroll, ProfileImg, ProfileModal, RightMenu, WorkspaceButton, WorkspaceModal, WorkspaceName, Workspaces, WorkspaceWrapper } from './styles';
import gravartar from 'gravatar';
import loadable from '@loadable/component';
import Menu from '@components/Menu';
import { Link } from 'react-router-dom';
import { IChannel, IUser } from '@typings/db';
import { Button, Input, Label } from '@pages/SignUp/styles';
import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { toast } from 'react-toastify';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import InviteChannelModal from '@components/InviteChannelModal';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const Workspace: VFC = () => {
  const { workspace } = useParams<{ workspace?: string }>()
  const { data: userData, mutate: revalidateUser } = useSWR<IUser | false>('/api/users', fetcher,);
  const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher,);
  const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher,)

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

  const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');

  const onLogout = useCallback(() => {
    axios
      .post('/api/users/logout', null, {
        withCredentials: true,
      })
      .then(() => {
        revalidateUser();
      });
  }, []);

  const onclickUserProfile = useCallback((e) => {
    e.stopPropagation()
    setShowUserMenu(prev => !prev);
  }, [])

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, [])

  const onCreateWorkspace = useCallback((e) => {
    e.preventDefault();
    if (!newWorkspace || !newWorkspace.trim()) return;
    if (!newUrl || !newUrl.trim()) return;
    axios.post('/api/workspaces', {
      workspace: newWorkspace, url: newUrl
    }, {
      withCredentials: true
    })
      .then(() => {
        revalidateUser();
        setShowCreateWorkspaceModal(false);
        setNewWorkspace('');
        setNewUrl('');
      })
      .catch((err) => {
        console.dir(err);
        toast.error(err.response?.data, { position: 'bottom-center' })

      });
  }, [newWorkspace, newUrl])

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteChannelModal(false);
    setShowInviteWorkspaceModal(false);
  }, [])

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal(prev => !prev)
  }, [])

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(prev => !prev)
  }, [])

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, [])

  if (!userData) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header>
        {userData && (<RightMenu>
          <span onClick={onclickUserProfile}>
            <ProfileImg src={gravartar.url(userData.email, { s: '20px', d: 'retro' })} alt={userData.nickname} />
            {showUserMenu ? (
              <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onclickUserProfile}>
                <ProfileModal>
                  <img src={gravartar.url(userData.email, { s: '36px', d: 'retro' })} alt={userData.nickname} />
                  <div>
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </Menu>) : null}
          </span>
        </RightMenu>)}
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${ws.url}/channel/일반`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            )
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
          <MenuScroll>
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80 }}>
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스 사용자 초대</button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            {channelData?.map((v, i) => (<div key={i}>{v.name}</div>))}
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id='workspace-label'>
            <span>워크스페이스 이름</span>
            <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
          </Label>
          <Label id='workspace-url-label'>
            <span>워크스페이스 url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type='submit'>생성하기</Button>
        </form>
      </Modal>
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateWorkspaceModal} />
      <InviteWorkspaceModal show={showInviteWorkspaceModal} onCloseModal={onCloseModal} setShowInviteWorkspaceModal={setShowInviteWorkspaceModal} />
      {/* <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} setShowInviteChannelModal={setShowInviteChannelModal} /> */}
    </div>
  );
};

export default Workspace;