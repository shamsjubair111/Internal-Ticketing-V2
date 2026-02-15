"use client";

import { useEffect, useState, useContext } from "react";
import { getTrashTickets, restoreTicketFromTrash } from "@/api/ticketingApis";
import Pagination from "@/components/shared/Pagination";
import { AlertCircle, Loader2, RotateCcw, XCircle } from "lucide-react";
import { alertContext } from "@/hooks/alertContext";
import DeleteTrashTicketModal from "./DeleteTrashTicketModal";
import { useRouter, useSearchParams } from "next/navigation";
import ClearTrashModal from "./ClearTrashModal";

export default function TrashTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAlertCtx } = useContext(alertContext);

  // Get page from URL or default to 1
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Update URL when page changes
  const setPage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Fetch Trash Tickets
  const fetchTrashTickets = async (pageNo) => {
    try {
      setLoading(true);
      const res = await getTrashTickets(pageNo);

      setTickets(res?.data?.data || []);
      setTotalTickets(res?.data?.total_tickets || 0);
    } catch (err) {
      console.error("Failed to load trash tickets:", err);
      setAlertCtx({
        title: "Error",
        message: "Failed to load trash tickets!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashTickets(page);
  }, [page]);

  // ------------------ RESTORE HANDLER ------------------
  const handleRestore = async (ticketId) => {
    try {
      const payload = { ticket_id: ticketId };
      const res = await restoreTicketFromTrash(payload);

      setAlertCtx({
        title: "Success",
        message: res?.data?.message || "Ticket restored successfully!",
        type: "success",
      });

      // Refresh list after restore
      fetchTrashTickets(page);
    } catch (err) {
      console.error("Restore error:", err);
      setAlertCtx({
        title: "Error",
        message:
          err?.response?.data?.message || "Failed to restore the ticket!",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ---------- HEADER ---------- */}
      <div className="bg-gray-50 px-6 pt-6 pb-3 flex-shrink-0">
        <div className="border border-gray-200 rounded-sm bg-white flex items-center justify-between h-[52px] px-5 w-full mb-4">
          <h3 className="font-bold text-[18px]">Trash Tickets</h3>

          <button
            onClick={() => setShowClearModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded"
          >
            Clear Trash
          </button>
        </div>

        {/* ---- TOP PAGINATION ---- */}
        <Pagination
          totalItems={totalTickets}
          itemsPerPage={10}
          currentPage={page}
          onPageChange={setPage}
          label={"tickets"}
        />
      </div>

      {/* ---------- TABLE CONTENT ---------- */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="w-full bg-white rounded-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  TICKET ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  PROBLEMATIC NUMBER
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  TITLE
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan="5" className="py-10 text-center">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto text-gray-500" />
                  </td>
                </tr>
              )}

              {/* No Tickets */}
              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-600">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    No trash tickets found.
                  </td>
                </tr>
              )}

              {/* Tickets List */}
              {!loading &&
                tickets.map((ticket) => (
                  <tr
                    key={ticket.ticket_id}
                    className="border-b border-gray-200 hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => router.push(`/trash/${ticket.ticket_id}`)}
                  >
                    <td className="px-4 py-3 text-sm">{ticket.ticket_id}</td>
                    <td className="px-4 py-3 text-sm">
                      {ticket.problematic_number}
                    </td>
                    <td className="px-4 py-3 text-sm truncate">
                      {ticket.title}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      {ticket.ticket_status}
                    </td>

                    <td className="px-4 py-3 flex gap-2">
                      {/* Restore */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent row click
                          handleRestore(ticket.ticket_id);
                        }}
                        className="p-2 rounded bg-yellow-100 hover:bg-yellow-200 transition"
                      >
                        <RotateCcw className="w-4 h-4 text-yellow-700" />
                      </button>

                      {/* Permanent Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent navigation
                          setDeleteData(ticket); // open delete modal
                        }}
                        className="p-2 rounded bg-red-100 hover:bg-red-200 transition"
                      >
                        <XCircle className="w-4 h-4 text-red-700" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteTrashTicketModal
        deleteData={deleteData}
        onClose={() => setDeleteData(null)}
        onSuccess={() => fetchTrashTickets(page)}
      />

      <ClearTrashModal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        onSuccess={() => fetchTrashTickets(page)}
      />
    </div>
  );
}
