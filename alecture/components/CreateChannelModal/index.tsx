import useInput from '@hooks/useInput';
import React, { useCallback, VFC } from 'react';
import Modal from '@components/Modal';
import { Label, Input, Button } from '@pages/SignUp/styles';
import axios from 'axios';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowCreateChannelModal: (flag: boolean) => void;
}

const CreateChannelModal: VFC<Props> = ({ show, onCloseModal, setShowCreateChannelModal }) => {
  const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');
  const { workspace, channel } = useParams<{ workspace: string, channel: string }>()
  const { data: userData } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 20000, // 2초
  });
  const { data: channelData, mutate: revalidateChannel } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher)

  const onCreateChannel = useCallback((e) => {
    e.preventDefault();
    if (!newChannel || !newChannel.trim()) {
      return;
    }
    axios.post(
      `/api/workspaces/${workspace}/channels`, {
      name: newChannel,
    }, {
      withCredentials: true,
    },
    ).then(() => {
      revalidateChannel()
      setShowCreateChannelModal(false);
      setNewChannel('');
    }).catch((err) => {
      console.dir(err);
      toast.error(err.response?.data, { position: 'bottom-center' })
    })
  }, [newChannel, revalidateChannel, setNewChannel, setShowCreateChannelModal]);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id='channel-label'>
          <span>채널</span>
          <Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button type='submit'>생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;