"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Table,
  Toast,
  toast,
} from "@heroui/react";

const rows = [
  { id: "1", name: "Alice", role: "Author" },
  { id: "2", name: "Bob", role: "Reader" },
];

export default function DevUiPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-2xl font-semibold">HeroUI smoke test</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Button</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Input</h2>
        <Input placeholder="Type here…" className="max-w-sm" />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Card</h2>
        <Card className="max-w-sm">
          <Card.Header>
            <Card.Title>Card title</Card.Title>
            <Card.Description>Card description</Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-sm">Card content area.</p>
          </Card.Content>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Modal</h2>
        <Button onPress={() => setModalOpen(true)}>Open modal</Button>
        <Modal isOpen={modalOpen} onOpenChange={setModalOpen}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>Modal heading</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <p className="text-sm">Modal body content.</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="ghost" onPress={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onPress={() => setModalOpen(false)}>Confirm</Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Table</h2>
        <Table aria-label="Sample table">
          <Table.Header>
            <Table.Column isRowHeader>Name</Table.Column>
            <Table.Column>Role</Table.Column>
          </Table.Header>
          <Table.Body items={rows}>
            {(item) => (
              <Table.Row id={item.id}>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.role}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Toast</h2>
        <Button onPress={() => toast("Saved successfully", { variant: "success" })}>
          Show toast
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Alert</h2>
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Success</Alert.Title>
            <Alert.Description>Everything looks good.</Alert.Description>
          </Alert.Content>
        </Alert>
      </section>
    </div>
  );
}
