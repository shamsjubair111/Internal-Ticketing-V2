"use client";

import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { FaCirclePlus } from "react-icons/fa6";
import { getAllSubGroups } from "@/api/ticketingApis";
import GroupList from "@/components/GroupList";
import AddGroupModal from "@/components/AddGroupModal";
import Pagination from "@/components/shared/Pagination";
import { useRouter, useSearchParams } from "next/navigation";

export default function GroupInfoPage() {
  const [loader, setLoader] = useState(false);
  const [groupData, setGroupData] = useState([]);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [totalGroups, setTotalGroups] = useState(0);
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

  // ✅ Fetch all groups + subgroups
  const getSubgroupData = async (pageNo = 1) => {
    try {
      setLoader(true);
      const res = await getAllSubGroups();
      const groups = Array.isArray(res?.data) ? res.data : [];
      setTotalGroups(groups.length);

      const startIndex = (pageNo - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setGroupData(groups.slice(startIndex, endIndex));
    } catch (err) {
      console.error("Error fetching subgroups:", err);
      setGroupData([]);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getSubgroupData(page);
  }, [page]);

  // ✅ Function to close modal & refresh list
  const handleGroupAdded = () => {
    setIsAddGroupModalOpen(false);
    getSubgroupData(page); // refresh data after adding
  };

  const resetToFirstPage = () => {
    setPage(1);
    getSubgroupData(1);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ---------- Header Section ---------- */}
      <div className="bg-gray-50 px-6 pt-6 pb-3 flex-shrink-0">
        <div className="border border-gray-200 rounded-sm bg-white flex items-center justify-between h-[52px] px-5 w-full mb-4 shadow-sm">
          <h1 className="font-bold text-[18px] text-primary">Group List</h1>

          <Button
            color="blue"
            className="flex items-center px-4 py-2 text-white text-sm font-semibold cursor-pointer"
            onClick={() => setIsAddGroupModalOpen(true)}
          >
            Add Group
            <FaCirclePlus className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* ✅ Pagination Bar (Full Width, Above List) */}
        {totalGroups > ITEMS_PER_PAGE && (
          <div className=" rounded-sm bg-white mt-2">
            <Pagination
              totalItems={totalGroups}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={page}
              onPageChange={setPage}
              label={"groups"}
            />
          </div>
        )}
      </div>

      {/* ---------- Content Section ---------- */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loader ? (
          <div className="flex items-center justify-center py-10">
            <i className="fa fa-refresh fa-spin text-2xl text-gray-500" />
          </div>
        ) : groupData.length > 0 ? (
          <div className="flex justify-center">
            <GroupList
              data={groupData}
              getSubgroup={getSubgroupData}
              resetToFirstPage={resetToFirstPage}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-500">
            No groups found.
          </div>
        )}
      </div>

      {/* ---------- Add Group Modal ---------- */}
      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        onSuccess={handleGroupAdded} // ✅ closes + refreshes
      />
    </div>
  );
}
