"use client";

import { DataTable } from "@/components/datatable/datatable";
import { ErrorResponse, PaginatedResponse } from "@/types/lark";

interface MockUser {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: boolean;
  joinDate: string;
}

const mockUsers: MockUser[] = [
  {
    id: "1",
    name: "สมชาย ใจดี",
    email: "somchai@company.com",
    department: "IT",
    position: "Developer",
    status: true,
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "สมหญิง รักงาน",
    email: "somying@company.com",
    department: "HR",
    position: "Manager",
    status: true,
    joinDate: "2022-06-20",
  },
  {
    id: "3",
    name: "วิชัย เก่งมาก",
    email: "wichai@company.com",
    department: "Finance",
    position: "Analyst",
    status: false,
    joinDate: "2023-03-10",
  },
  {
    id: "4",
    name: "มาลี สวยงาม",
    email: "malee@company.com",
    department: "Marketing",
    position: "Specialist",
    status: true,
    joinDate: "2022-11-05",
  },
  {
    id: "5",
    name: "ประเสริฐ ดีเลิศ",
    email: "prasert@company.com",
    department: "IT",
    position: "Senior Developer",
    status: true,
    joinDate: "2021-08-12",
  },
  {
    id: "6",
    name: "นิตยา ใจเย็น",
    email: "nitya@company.com",
    department: "Customer Service",
    position: "Representative",
    status: true,
    joinDate: "2023-05-18",
  },
  {
    id: "7",
    name: "กิตติ ฉลาดมาก",
    email: "kitti@company.com",
    department: "IT",
    position: "DevOps Engineer",
    status: false,
    joinDate: "2022-09-30",
  },
  {
    id: "8",
    name: "สุภาพ เรียบร้อย",
    email: "supap@company.com",
    department: "HR",
    position: "Coordinator",
    status: true,
    joinDate: "2023-02-14",
  },
  {
    id: "9",
    name: "ธนาคาร รวยมาก",
    email: "thanakarn@company.com",
    department: "Finance",
    position: "Manager",
    status: true,
    joinDate: "2021-12-01",
  },
  {
    id: "10",
    name: "แสงดาว ส่องแสง",
    email: "saengdao@company.com",
    department: "Marketing",
    position: "Manager",
    status: true,
    joinDate: "2022-04-22",
  },
  {
    id: "11",
    name: "ภูเขา สูงใหญ่",
    email: "phukhao@company.com",
    department: "Operations",
    position: "Supervisor",
    status: false,
    joinDate: "2023-07-08",
  },
  {
    id: "12",
    name: "น้ำใส ใสสะอาด",
    email: "namsai@company.com",
    department: "Customer Service",
    position: "Manager",
    status: true,
    joinDate: "2022-01-10",
  },
];

const mockFetchUsers = async (
  limit: number,
  offset: number | "",
  filter: string,
): Promise<PaginatedResponse<MockUser> | ErrorResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredUsers = mockUsers;
  if (filter) {
    filteredUsers = mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(filter.toLowerCase()) ||
        user.email.toLowerCase().includes(filter.toLowerCase()) ||
        user.department.toLowerCase().includes(filter.toLowerCase()) ||
        user.position.toLowerCase().includes(filter.toLowerCase()),
    );
  }
  const startIndex = offset === "" ? 0 : offset;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const nextOffset = endIndex < filteredUsers.length ? endIndex : -1;

  return {
    datas: paginatedUsers,
    next: nextOffset,
  };
};

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mock Data Table</h1>
      <DataTable
        fetchData={mockFetchUsers}
        columns={[
          { key: "name", label: "ชื่อ" },
          { key: "email", label: "อีเมล" },
          { key: "department", label: "แผนก" },
          { key: "position", label: "ตำแหน่ง" },
          { key: "status", label: "สถานะ" },
          { key: "joinDate", label: "วันที่เข้าร่วม" },
        ]}
      />
    </div>
  );
}
