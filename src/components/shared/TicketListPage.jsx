"use client";
import { useContext, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { alertContext } from "@/hooks/alertContext";
import { useTicketContext } from "@/context/TicketContext";
import { getSearchTicket, getUserInfo } from "@/api/tickets";
import Filter from "@/components/shared/Filter";
import Pagination from "@/components/shared/Pagination";
import Table from "@/components/shared/Table";
import { ticketColumns } from "@/utils/tableColumns";
import { Plus } from "lucide-react";

// These filter IDs use getSearchTicket instead of query params
const SEARCH_FILTER_IDS = [6, 7, 8];

function TicketListView({ title, fetchFn }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAlertCtx } = useContext(alertContext);
  const { selectedStatus } = useTicketContext();

  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState([]);
  const [userType, setUserType] = useState("");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const setPage = (p) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    getUserInfo()
      .then((r) => setUserType(r.data.data[0]?.user_type || ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("ticket_filters");
    if (saved) {
      try {
        setFilters(JSON.parse(saved));
      } catch {
        localStorage.removeItem("ticket_filters");
      }
    }
  }, []);

  // Check if any active filter is a search filter (Ticket ID, Company Name, Service)
  const searchFilter = filters.find(
    (f) => SEARCH_FILTER_IDS.includes(f.id) && f.value,
  );

  const buildParams = () => {
    const p = {};
    filters.forEach((f) => {
      if (!f.value) return;
      if (f.label === "Status") p.status = f.value;
      else if (f.label === "Priority") p.priority = f.value;
      else if (f.label === "Service Type") p.service_type = f.value;
      else if (f.label === "Start Date") p.start_date = f.value;
      else if (f.label === "End Date") p.end_date = f.value;
    });
    if (!p.status && selectedStatus) p.status = selectedStatus;
    return p;
  };

  const fetchTickets = async (pageNo) => {
    setLoading(true);
    setTickets([]);
    try {
      if (searchFilter) {
        // Use search endpoint for Ticket ID / Company Name / Service
        const res = await getSearchTicket(
          searchFilter.searchKey,
          searchFilter.value,
          pageNo,
        );
        setTickets(res.data.data || []);
        setTotalTickets(res.data.total_data || res.data.total_tickets || 0);
      } else {
        // Use normal endpoint with query params
        const params = buildParams();
        const res = await fetchFn(pageNo, params);
        setTickets(res.data.data || []);
        setTotalTickets(res.data.total_data || res.data.total_tickets || 0);
      }
    } catch {
      setAlertCtx({
        title: "Error",
        message: "Failed to load tickets.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchTickets(page), 100);
    return () => clearTimeout(t);
  }, [page, filters, selectedStatus]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-50 px-6 pt-6 pb-3 flex-shrink-0">
        <div className="border border-gray-200 rounded-sm bg-white flex items-center justify-between min-h-[52px] px-3 md:px-5 w-full mb-4">
          <h3 className="font-bold text-base md:text-[18px] py-2">{title}</h3>
          <button
            onClick={() => router.push("/issue-ticket")}
            className="md:hidden bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>

        <Filter onFilterChange={setFilters} userType={userType} />

        <Pagination
          totalItems={totalTickets}
          itemsPerPage={10}
          currentPage={page}
          onPageChange={setPage}
          label="tickets"
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

export default function TicketListPage({ title, fetchFn }) {
  return (
    <Suspense>
      <TicketListView title={title} fetchFn={fetchFn} />
    </Suspense>
  );
}
