"use client";

import { useEffect, useState } from "react";
import { getTicketsByPage } from "@/api/ticketingApis";
import Filter from "@/components/shared/Filter";
import Pagination from "@/components/shared/Pagination";
import Table from "@/components/shared/Table";
import { useTicketContext } from "@/context/TicketContext";
import { ticketColumns } from "@/utils/tableColumns";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedItem, selectedStatus } = useTicketContext();
  const handleFilterChange = (updatedFilters) => setFilters(updatedFilters);

  // Get page from URL or default to 1
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Update URL when page changes
  const setPage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // ✅ Build query params based on selected filters
  const buildFilterParams = () => {
    const params = {};
    filters.forEach((f) => {
      if (f.value) {
        switch (f.label) {
          case "Ticket Id":
            params.ticketIdForMyTicket = f.value;
            break;
          case "Problematic Number":
            params.pNumberForMyTicket = f.value;
            break;
          case "Status":
            params.statusForMyTicket = f.value.toLowerCase();
            break;
          case "Issued To":
            params.issueForMyTicket = f.value;
            break;
          case "Ticket Type":
            params.selectedTab = f.value;
            break;
          case "Group":
            params.selectedGroupId = f.value;
            break;
          case "Subgroup":
            params.selectedSubGroupId = f.value;
            break;
          case "Start Date":
            params.startDate = f.value;
            break;
          case "End Date":
            params.endDate = f.value;
            break;
          default:
            break;
        }
      }
    });
    return params;
  };

  // ✅ API Fetch Function (now includes sidebar item type)
  const fetchTickets = async (pageNo) => {
    const params = buildFilterParams();
    setLoading(true);
    setTickets([]);

    try {
      const res = await getTicketsByPage(
        pageNo,
        params.selectedTab || "",
        params.selectedGroupId || "",
        params.ticketIdForMyTicket || "",
        params.issueForMyTicket || "",
        params.selectedSubGroupId || "",
        selectedStatus === "to_handle"
          ? "open,in_progress"
          : params.statusForMyTicket || selectedStatus || "",
        params.pNumberForMyTicket || "",
        params.startDate || "",
        params.endDate || "",
      );

      setTickets(res.data.data);
      setTotalTickets(res.data.total_tickets);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load saved filters once
  useEffect(() => {
    const saved = localStorage.getItem("ticket_filters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFilters(parsed);
      } catch (e) {
        console.error("Failed to parse saved filters", e);
        localStorage.removeItem("ticket_filters");
      }
    }
  }, []);

  // ✅ Debounce API call — now runs when filters, page, or sidebar selection changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTickets(page);
    }, 100); // 0.6s debounce for smoother UX

    return () => clearTimeout(debounce);
  }, [page, filters, selectedItem, selectedStatus]); // ✅ added selectedItem dependency

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-50 px-6 pt-6 pb-3 flex-shrink-0">
        <div className="border border-gray-200 rounded-sm bg-white flex items-center justify-between min-h-[52px] px-3 md:px-5 w-full mb-4">
          <h3 className="font-bold text-base md:text-[18px] py-2">
            {selectedItem === "forwarded"
              ? "Forwarded Tickets"
              : selectedItem === "group"
                ? "Group Tickets"
                : selectedItem === "user"
                  ? "User Tickets"
                  : selectedItem === "report"
                    ? "Reports"
                    : "All Recent Tickets"}
          </h3>

          {/* New Ticket Button - Only visible on mobile */}
          <button
            onClick={() => router.push("/createTicket")}
            className="md:hidden bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </button>
        </div>

        <Filter onFilterChange={handleFilterChange} />
        <Pagination
          totalItems={totalTickets}
          itemsPerPage={10}
          currentPage={page}
          onPageChange={setPage}
          label={"tickets"}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <Table
          data={tickets}
          loading={loading}
          columns={ticketColumns}
          reload={fetchTickets}
          page={page}
        />
      </div>
    </div>
  );
}
