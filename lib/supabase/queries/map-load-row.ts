import { getActiveHoldKeysFromLoad } from '@/lib/loads/active-holds';
import type { LoadDetail, LoadStatus } from '@/types';

type ContainerEmbed = {
  container_number: string | null;
  bol_number?: string | null;
  size?: string | null;
  type?: string | null;
  seal_number?: string | null;
};

type CustomerEmbed = {
  name: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
};

type DriverEmbed = {
  name: string | null;
  phone?: string | null;
};

export type LoadListRow = {
  id: string;
  reference_number: string;
  status: LoadStatus;
  pickup_location: string | null;
  delivery_location: string | null;
  return_location: string | null;
  pickup_apt_from: string | null;
  pickup_apt_to: string | null;
  delivery_apt_from: string | null;
  delivery_apt_to: string | null;
  is_hot: boolean;
  notes: string | null;
  freight_hold: string | null;
  customs_hold: string | null;
  terminal_hold: string | null;
  fees_hold: string | null;
  other_hold: string | null;
  carrier_hold: boolean | null;
  containers: ContainerEmbed | ContainerEmbed[] | null;
  customers: CustomerEmbed | CustomerEmbed[] | null;
};

export type LoadDetailRow = LoadListRow & {
  load_type: string | null;
  route_type: string | null;
  ssl: string | null;
  mbol: string | null;
  house_bol: string | null;
  seal_number: string | null;
  chassis_number: string | null;
  container_size: string | null;
  scheduled_pickup: string | null;
  actual_pickup: string | null;
  actual_delivery: string | null;
  completed_date: string | null;
  created_at: string | null;
  is_hazmat: boolean | null;
  is_overweight: boolean | null;
  is_bonded: boolean | null;
  drivers: DriverEmbed | DriverEmbed[] | null;
};

function firstEmbed<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatCustomerAddress(customer: CustomerEmbed | null): string | null {
  if (!customer) return null;
  const parts = [
    customer.address,
    [customer.city, customer.state].filter(Boolean).join(', '),
    customer.zip_code,
  ].filter((p) => p && String(p).trim());
  return parts.length ? parts.join(' · ') : null;
}

const DETAIL_DEFAULTS = {
  load_type: null,
  route_type: null,
  ssl: null,
  mbol: null,
  house_bol: null,
  seal_number: null,
  chassis_number: null,
  container_size: null,
  container_type: null,
  bol_number: null,
  scheduled_pickup: null,
  actual_pickup: null,
  actual_delivery: null,
  completed_date: null,
  created_at: null,
  customer_phone: null,
  customer_address: null,
  driver_name: null,
  is_hazmat: false,
  is_overweight: false,
  is_bonded: false,
} satisfies Partial<LoadDetail>;

export function mapLoadRowToDetail(row: LoadListRow): LoadDetail {
  const container = firstEmbed(row.containers);
  const customer = firstEmbed(row.customers);

  return {
    id: row.id,
    reference_number: row.reference_number,
    status: row.status,
    container_number: container?.container_number ?? null,
    pickup_location: row.pickup_location,
    delivery_location: row.delivery_location,
    return_location: row.return_location,
    pickup_apt_from: row.pickup_apt_from,
    pickup_apt_to: row.pickup_apt_to,
    delivery_apt_from: row.delivery_apt_from,
    delivery_apt_to: row.delivery_apt_to,
    is_hot: row.is_hot,
    notes: row.notes,
    customer_name: customer?.name ?? null,
    active_holds: getActiveHoldKeysFromLoad(row),
    ...DETAIL_DEFAULTS,
    bol_number: container?.bol_number ?? null,
    container_type: container?.type ?? null,
    seal_number: container?.seal_number ?? null,
  };
}

export function mapLoadDetailRowToDetail(row: LoadDetailRow): LoadDetail {
  const base = mapLoadRowToDetail(row);
  const container = firstEmbed(row.containers);
  const customer = firstEmbed(row.customers);
  const driver = firstEmbed(row.drivers);

  return {
    ...base,
    load_type: row.load_type,
    route_type: row.route_type,
    ssl: row.ssl,
    mbol: row.mbol,
    house_bol: row.house_bol,
    seal_number: row.seal_number ?? container?.seal_number ?? base.seal_number,
    chassis_number: row.chassis_number,
    container_size: row.container_size ?? container?.size ?? null,
    container_type: container?.type ?? null,
    bol_number: container?.bol_number ?? null,
    scheduled_pickup: row.scheduled_pickup,
    actual_pickup: row.actual_pickup,
    actual_delivery: row.actual_delivery,
    completed_date: row.completed_date,
    created_at: row.created_at,
    customer_phone: customer?.phone ?? null,
    customer_address: formatCustomerAddress(customer),
    driver_name: driver?.name ?? null,
    is_hazmat: row.is_hazmat ?? false,
    is_overweight: row.is_overweight ?? false,
    is_bonded: row.is_bonded ?? false,
  };
}

export function mapLoadRowsToDetails(rows: LoadListRow[]): LoadDetail[] {
  return rows.map(mapLoadRowToDetail);
}

/** Whether another page may exist after the current fetch. */
export function hasMoreDriverLoads(params: {
  page: number;
  pageSize: number;
  rowCount: number;
  totalCount: number | null;
}): boolean {
  const { page, pageSize, rowCount, totalCount } = params;
  if (rowCount === 0) return false;
  if (totalCount != null) {
    return page * pageSize + rowCount < totalCount;
  }
  return rowCount === pageSize;
}
