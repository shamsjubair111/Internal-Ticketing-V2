"use client";

import { useEffect, useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import { getAllTags } from "@/api/ticketingApis";
import { useRouter, useSearchParams } from "next/navigation";

import Pagination from "@/components/shared/Pagination";
import AddTagModal from "./AddTagModal";
import EditTagModal from "./EditTagModal";
import DeleteTagModal from "./DeleteTagModal";
import TagList from "./TagList";

export default function TagsPage() {
  const [loader, setLoader] = useState(false);
  const [tags, setTags] = useState([]);
  const [totalTags, setTotalTags] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);

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

  const getData = async (pageNo = 1) => {
    try {
      setLoader(true);

      const res = await getAllTags(pageNo, ITEMS_PER_PAGE);
      setTags(res?.data?.data || []);

      const meta = res?.data?.meta || {};
      setTotalTags(meta.total || 0);
    } catch (err) {
      console.error("Error fetching tags:", err);
      setTags([]);
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 px-6 pt-6 pb-3">
        <div className="border border-gray-200 rounded-sm bg-white flex items-center justify-between h-[52px] px-5 w-full shadow-sm">
          <h1 className="font-bold text-[18px] text-primary">Tags</h1>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-sm font-semibold"
          >
            Add Tag
            <FaCirclePlus className="ml-2 w-4 h-4" />
          </button>
        </div>

        <div className="rounded-sm bg-white mt-2">
          <Pagination
            totalItems={totalTags}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={page}
            onPageChange={setPage}
            label={"tags"}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loader ? (
          <div className="flex justify-center py-10 text-gray-500">
            Loading...
          </div>
        ) : (
          <TagList
            data={tags}
            setEditData={setEditData}
            setDeleteData={setDeleteData}
          />
        )}
      </div>

      {/* Modals */}
      <AddTagModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={resetToFirstPage}
      />

      <EditTagModal
        editData={editData}
        onClose={() => setEditData(null)}
        onSuccess={() => getData(page)}
      />

      <DeleteTagModal
        deleteData={deleteData}
        onClose={() => setDeleteData(null)}
        onSuccess={() => getData(page)}
      />
    </div>
  );
}
