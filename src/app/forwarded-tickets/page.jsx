"use client";

import { useEffect, useState } from "react";
import Table from "@/components/shared/Table";
import Pagination from "@/components/shared/Pagination";
import { getForwardedTicket } from "@/api/ticketingApis";
import { ticketColumns } from "@/utils/tableColumns";
import Filter from "@/components/shared/Filter";
import { useRouter, useSearchParams } from "next/navigation";

export default function ForwardedTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState([]);
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

  // Fetch forwarded tickets
  const fetchForwardedTickets = async (pageNo) => {
    try {
      setLoading(true);

      const params = buildParams(filters);
      const res = await getForwardedTicket(pageNo, params);

      setTickets(res?.data?.data || []);
      setTotalTickets(res?.data?.total_tickets || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForwardedTickets(page);
  }, [page, filters]);

  const buildParams = (filters) => {
    const params = {};

    filters.forEach((f) => {
      if (!f.value) return;

      switch (f.label) {
        case "Ticket Id":
          params.ticket_id = f.value;
          break;
        case "Problematic Number":
          params.problematic_number = f.value;
          break;
        case "Status":
          params.status = f.value;
          break;
        case "Issued To":
          params.issued_to = f.value;
          break;
        case "Ticket Type":
          params.ticket_type = f.value;
          break;
        case "Group":
          params.group_id = f.value;
          break;
        case "Subgroup":
          params.sub_group_id = f.value;
          break;
        case "Start Date":
          params.start_date = f.value;
          break;
        case "End Date":
          params.end_date = f.value;
          break;
      }
    });

    return params;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed top section */}
      <div className="bg-gray-50 px-6 pt-6 pb-3 flex-shrink-0">
        <div className="border border-gray-200 rounded-sm bg-white flex items-center h-[52px] px-5 w-full mb-4">
          <h3 className="font-bold text-[18px]">Forwarded Tickets</h3>
        </div>

        {/* <Filter onFilterChange={setFilters} /> */}

        {/* Pagination at top */}
        <Pagination
          totalItems={totalTickets}
          itemsPerPage={10}
          currentPage={page}
          onPageChange={setPage}
          label={"tickets"}
        />
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <Table
          data={tickets}
          loading={loading}
          columns={ticketColumns}
          reload={() => fetchForwardedTickets(page)}
          page={page}
        />
      </div>
    </div>
  );
}
