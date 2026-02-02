import type { Meta, StoryObj } from "@storybook/react";
import DataGrid from "../components/DataGrid/DataGrid";

const meta: Meta<typeof DataGrid> = {
  title: "DataGrid/Performance",
  component: DataGrid,
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

const bigData = Array.from({ length: 50000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  age: 20 + (i % 50),
  score: ((i * 17) % 100) * 10,
  category: i % 2 === 0 ? 'A' : 'B',
  status: i % 3 === 0 ? 'Active' : 'Pending',
  email: `user${i + 1}@example.com`,
  phone: `555-010${i % 10}`,
  city: `City ${i % 100}`,
  country: `Country ${i % 10}`,
  active: i % 2 === 0,
}));

export const FiftyThousandRows: Story = {
  args: {
    data: bigData,
    columns: [
      { id: "id", title: "ID", width: 80, pinned: 'left' },
      { id: "name", title: "Name", width: 200, sortable: true },
      { id: "age", title: "Age", width: 100, sortable: true },
      { id: "score", title: "Score", width: 120, sortable: true },
      { id: "category", title: "Cat", width: 80 },
      { id: "status", title: "Status", width: 120 },
      { id: "email", title: "Email", width: 250 },
      { id: "phone", title: "Phone", width: 150 },
      { id: "city", title: "City", width: 150 },
      { id: "country", title: "Country", width: 150, pinned: 'right' },
    ],
  },
};