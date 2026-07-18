import { strings } from '@/constants/strings';
import type { DriverMoveCard } from '@/lib/loads/driver-move-card';
import type { LoadDetail, LoadStatus } from '@/types';

/**
 * Maps a mobile move card into the detail shape used by `/load/[id]`.
 * Used when Supabase detail is blocked because assignment lives on `load_moves`,
 * not `loads.driver_id` (multi-move / Q14 model).
 *
 * Only copies fields the card actually carries. Unknown flags stay null so the
 * UI does not invent "No" for overweight/bonded (TASKS E.3).
 */
export function mapDriverMoveCardToLoadDetail(card: DriverMoveCard): LoadDetail {
  const reference = card.reference_number?.trim() || strings.loadDetail.emDash;
  const statusLabel =
    card.status.trim() || card.progress.label.trim() || strings.loadDetail.emDash;

  return {
    id: card.load_id,
    reference_number: reference,
    status: statusLabel as LoadStatus,
    container_number: card.container_number,
    pickup_location: card.pickup_location,
    delivery_location: card.delivery_location,
    delivery_apt_from: null,
    is_hot: card.is_hot,
    active_holds: [],
    return_location: card.return_location,
    pickup_apt_from: null,
    pickup_apt_to: null,
    delivery_apt_to: null,
    notes: null,
    customer_name: card.customer,
    load_type: card.load_type,
    route_type: null,
    ssl: null,
    mbol: null,
    house_bol: null,
    seal_number: card.seal_number,
    chassis_number: card.chassis_number,
    container_size: card.container_size,
    container_type: card.container_type,
    bol_number: null,
    scheduled_pickup: null,
    actual_pickup: null,
    actual_delivery: null,
    completed_date: null,
    created_at: card.assigned_date,
    customer_phone: null,
    customer_address: null,
    driver_name: null,
    driver_phone: null,
    is_hazmat: card.is_hazmat,
    is_overweight: null,
    is_bonded: null,
  };
}
