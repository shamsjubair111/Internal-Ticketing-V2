"use client";

import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { FaCirclePlus } from "react-icons/fa6";
import { getUser } from "@/api/ticketingApis";
import UserList from "@/components/user/UserList";
import Pagination from "@/components/shared/Pagination";
import AddUserModal from "@/components/user/AddUserModal";
import { useRouter, useSearchParams } from "next/navigation";

export default function UserInfoPage() {
  const [loader, setLoader] = useState(false);
  const [userData, setUserData] = useState([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get page from URL or default to 1
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Update URL when page changes
  const setPage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // ✅ Fetch Users
  const getData = async (pageNo = 1) => {
    try {
      setLoader(true);
      const res = await getUser();
      const users = Array.isArray(res?.data) ? res.data : [];
      setTotalUsers(users.length);

      const startIndex = (pageNo - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setUserData(users.slice(startIndex, endIndex));
    } catch (err) {
      console.error("Error fetching users:", err);
      setUserData([]);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData(page);
  }, [page]);

  const resetToFirstPage = () => {
    setPage(1);
    getData(1);
  };

  const handleUserAdded = () => {
    setIsAddUserModalOpen(false);
    getData(page);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ---------- Header Section ---------- */}
      <div className="bg-gray-50 px-6 pt-6 pb-3 flex-shrink-0">
        <div className="border border-gray-200 rounded-sm bg-white flex items-center justify-between h-[52px] px-5 w-full mb-4 shadow-sm">
          <h1 className="font-bold text-[18px] text-primary">User List</h1>

          <Button
            color="blue"
            className="flex items-center px-4 py-2 text-white text-sm font-semibold cursor-pointer"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            Add User
            <FaCirclePlus className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* ✅ Pagination Bar */}
        {/* {totalUsers > ITEMS_PER_PAGE && ( */}
        <div className="rounded-sm bg-white mt-2">
          <Pagination
            totalItems={totalUsers}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={page}
            onPageChange={setPage}
            label={"users"}
          />
        </div>
        {/* )} */}
      </div>

      {/* ---------- Content Section ---------- */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loader ? (
          <div className="flex items-center justify-center py-10">
            <i className="fa fa-refresh fa-spin text-2xl text-gray-500" />
          </div>
        ) : userData.length > 0 ? (
          <div className="flex justify-center">
            <UserList
              data={userData}
              getData={getData}
              resetToFirstPage={resetToFirstPage}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-500">
            No users found.
          </div>
        )}
      </div>

      {/* ---------- Add User Modal ---------- */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={handleUserAdded}
      />
    </div>
  );
}
