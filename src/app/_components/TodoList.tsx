'use client';

import { useState, FC } from 'react';
import { trpc } from '../_trpc/client';
import { serverClient } from '../_trpc/serverClient';

type TodoListProps = {
  initialTodos: Awaited<ReturnType<(typeof serverClient)['getTodos']>>;
};

export const TodoList: FC<TodoListProps> = ({ initialTodos }) => {
  const { data, refetch } = trpc.getTodos.useQuery(undefined, {
    initialData: initialTodos,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const { mutate } = trpc.addTodo.useMutation({
    onSettled: () => refetch(),
  });
  const [content, setContent] = useState('');

  const handleAddTodo = async () => {
    if (content.length) {
      mutate(content);
      setContent('');
    }
  };

  const setDone = trpc.setDone.useMutation({
    onSettled: () => refetch(),
  });

  return (
    <div>
      <label htmlFor='content'>Content</label>
      <input
        id='content'
        type='text'
        value={content}
        onChange={e => setContent(e.target.value)}
        className='text-black'
      />
      <button onClick={handleAddTodo}>Add todo</button>
      {data?.map(({ content, id, done }) => (
        <div key={id} className='flex gap-3 items-center'>
          <input
            id={`check-${id}`}
            type='checkbox'
            checked={!!done}
            style={{ zoom: 1.5 }}
            onChange={async () => {
              setDone.mutate({
                id: id,
                done: done ? 0 : 1,
              });
            }}
          />
          <label htmlFor={`check-${id}`}>{content}</label>
        </div>
      ))}
    </div>
  );
};
