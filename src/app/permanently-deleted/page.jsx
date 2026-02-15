"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPermanentlyDeletedTickets } from "@/api/ticketingApis";
import Pagination from "@/components/shared/Pagination";
import { AlertCircle, Loader2 } from "lucide-react";
import { alertContext } from "@/hooks/alertContext";

export default function PermanentlyDeletedTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);

  const { setAlertCtx } = useContext(alertContext);
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

  // -------------------- FETCH API --------------------
  const fetchDeletedTickets = async (pageNo) => {
    try {
      setLoading(true);
      const res = await getPermanentlyDeletedTickets(pageNo);

      setTickets(res?.data?.data || []);
      setTotalTickets(res?.data?.total_tickets || 0);
    } catch (err) {
      console.error("Failed to load permanently deleted tickets:", err);
      setAlertCtx({
        title: "Error",
        message: "Failed to load permanently deleted tickets!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedTickets(page);
  }, [page]);

  return (
    <div className="flex flex-col h-full">
      {/* ---------- HEADER ---------- */}
      <div className="bg-gray-50 px-6 pt-6 pb-3 flex-shrink-0">
        <div className="border border-gray-200 rounded-sm bg-white flex items-center h-[52px] px-5 w-full mb-4">
          <h3 className="font-bold text-[18px]">Permanently Deleted Tickets</h3>
        </div>

        {/* Pagination */}
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
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan="4" className="py-10 text-center">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto text-gray-500" />
                  </td>
                </tr>
              )}

              {/* No Tickets */}
              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-600">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    No permanently deleted tickets found.
                  </td>
                </tr>
              )}

              {/* Tickets */}
              {!loading &&
                tickets.map((ticket) => (
                  <tr
                    key={ticket.ticket_id}
                    className="border-b border-gray-200 hover:bg-blue-50 transition cursor-pointer"
                    onClick={() =>
                      router.push(`/permanently-deleted/${ticket.ticket_id}`)
                    }
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
