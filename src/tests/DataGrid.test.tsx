import { render, screen } from "@testing-library/react";
import DataGrid from "../components/DataGrid/DataGrid";

describe("DataGrid Component", () => {
  const sampleData = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 },
  ];
  const sampleColumns = [
    { id: "id", title: "ID", width: 100 },
    { id: "name", title: "Name", width: 100 },
    { id: "age", title: "Age", width: 100 },
  ];

  test("renders headers correctly", () => {
    render(<DataGrid data={sampleData} columns={sampleColumns} />);
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
  });

  test("renders rows correctly", () => {
    render(<DataGrid data={sampleData} columns={sampleColumns} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});