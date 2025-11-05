import React from 'react';
import { Modal, Stack, TextInput, Select, Button, Group } from '@mantine/core';

interface AddMemberModalProps {
  opened: boolean;
  onClose: () => void;
  onAdd: (userId: string, role: 'OWNER' | 'DEPUTY' | 'MEMBER') => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ opened, onClose, onAdd }) => {
  const [userId, setUserId] = React.useState('');
  const [role, setRole] = React.useState<'OWNER' | 'DEPUTY' | 'MEMBER'>('MEMBER');

  const canSubmit = userId.trim().length > 0 && !!role;

  return (
    <Modal opened={opened} onClose={onClose} title="Add Project Member" centered>
      <Stack gap="md">
        <TextInput label="User ID" placeholder="auth0|..." value={userId} onChange={(e) => setUserId(e.currentTarget.value)} required />
        <Select
          label="Role"
          data={[
            { value: 'MEMBER', label: 'Member' },
            { value: 'DEPUTY', label: 'Deputy' },
            { value: 'OWNER', label: 'Owner' },
          ]}
          value={role}
          onChange={(v) => setRole((v as any) || 'MEMBER')}
          required
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button disabled={!canSubmit} onClick={() => { onAdd(userId, role); onClose(); }}>Add</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AddMemberModal;


