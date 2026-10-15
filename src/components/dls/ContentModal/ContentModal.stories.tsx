/* eslint-disable react/no-multi-comp */
import { useState } from 'react';

import Button, { ButtonVariant } from '../Button/Button';
import Spinner from '../Spinner/Spinner';

import ContentModal from './ContentModal';

export default {
  title: 'dls/ContentModal',
  component: ContentModal,
};

const content = (
  <p>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perspiciatis, veritatis. Temporibus
    quod accusantium quos modi aut? Doloremque, molestiae? Repudiandae consequatur praesentium
    cupiditate vitae dignissimos architecto, aut sunt laboriosam totam possimus porro suscipit
    excepturi ratione ipsa eaque error nam nisi provident velit. Sequi nam cupiditate quisquam, quo,
    necessitatibus nulla quam aliquid perferendis quae voluptate sapiente quod explicabo libero qui
    iusto. Soluta laudantium maiores consectetur velit, fuga nisi harum eligendi assumenda
    perferendis voluptate. Eum alias aspernatur et similique cum autem vel quos dolores earum quidem
    asperiores nihil veritatis, minus nulla vero exercitationem nisi sint consequatur id dolore
    atque laborum labore eveniet. Dolore, rem ratione animi ad repellendus amet minus velit magni
    vel adipisci, dolorum, magnam facere quasi? Quaerat itaque labore, culpa ex quos perspiciatis
    reiciendis soluta nobis magnam, quo vitae doloribus asperiores! Nam distinctio placeat ad
    consequuntur eligendi voluptate, debitis neque atque rerum est blanditiis obcaecati, explicabo
    omnis eaque! Quam assumenda doloremque in rem nostrum. Voluptatum tempora libero, sed aspernatur
    quasi deleniti deserunt veniam ipsa voluptate neque quibusdam eum itaque velit ipsum maiores
    architecto pariatur quod! Mollitia minima nulla hic corporis velit sed asperiores quod
    similique. Ducimus, veritatis officia repellat exercitationem quo laudantium provident quis
    accusantium eum dolore pariatur, mollitia nisi dolor!
  </p>
);

export const Normal = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open</Button>
      <ContentModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {content}
        {content}
        {content}
        {content}
        {content}
        {content}
        {content}
      </ContentModal>
    </>
  );
};

export const Loading = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open</Button>
      <ContentModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Spinner />
      </ContentModal>
    </>
  );
};

export const UnTriggered = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open</Button>
      <ContentModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {content}
        {content}
        {content}
        {content}
        {content}
        {content}
      </ContentModal>
    </>
  );
};

export const WithoutCloseIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open</Button>
      <ContentModal isOpen={isOpen} onClose={() => setIsOpen(false)} hasCloseButton={false}>
        {content}
        {content}
        {content}
        {content}
        {content}
        {content}
      </ContentModal>
    </>
  );
};

export const WithHeaderAndFooter = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open</Button>
      <ContentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        header="Terms of Service"
        hasCloseButton
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant={ButtonVariant.Ghost} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>Accept</Button>
          </div>
        }
      >
        <p>Please read these terms carefully before using our service.</p>
        <p style={{ marginTop: '1rem' }}>
          By using the service, you agree to be bound by these terms.
        </p>
      </ContentModal>
    </>
  );
};
