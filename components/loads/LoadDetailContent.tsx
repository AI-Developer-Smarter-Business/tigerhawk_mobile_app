import { StyleSheet, Text, View } from 'react-native';

import { DeliveryWaitSection } from '@/components/loads/DeliveryWaitSection';
import { LoadDetailHero } from '@/components/loads/LoadDetailHero';
import { LoadDocumentsSection } from '@/components/loads/LoadDocumentsSection';
import { LoadLocationSection } from '@/components/loads/LoadLocationSection';
import { LoadDetailMeta, LoadDetailRow } from '@/components/loads/LoadDetailRow';
import { Card } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { formatHoldLabel } from '@/lib/loads/active-holds';
import {
  formatAppointment,
  formatAppointmentRange,
} from '@/lib/loads';
import {
  formatDisplayValue,
  hasContainerInfo,
  hasLoadFlags,
  hasShipmentInfo,
  hasTimeline,
} from '@/lib/loads/load-detail-helpers';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';
import type { LoadDetail } from '@/types';
import type { LoadDocument } from '@/types/load-document';
import type { DeliveryWaitTimerState } from '@/hooks/useDeliveryWaitTimer';

type LoadDetailContentProps = {
  load: LoadDetail;
  waitTimer: DeliveryWaitTimerState;
  fieldActionPending?: boolean;
  error: string | null;
  onRetry: () => void;
  documents: LoadDocument[];
  documentsLoading: boolean;
  documentsError: string | null;
  onDocumentsRetry: () => void;
  onRefreshDocuments: () => Promise<LoadDocument[]>;
  onUploadDocument: (file: TmsUploadFileDescriptor) => Promise<void>;
};

export function LoadDetailContent({
  load,
  waitTimer,
  fieldActionPending = false,
  error,
  onRetry,
  documents,
  documentsLoading,
  documentsError,
  onDocumentsRetry,
  onRefreshDocuments,
  onUploadDocument,
}: LoadDetailContentProps) {
  return (
    <>
      {error ? (
        <ErrorBanner
          message={error}
          actionLabel={strings.loads.retry}
          onAction={onRetry}
        />
      ) : null}

      <LoadDetailHero load={load} />

      <DeliveryWaitSection timer={waitTimer} fieldActionPending={fieldActionPending} />

      {load.active_holds.length > 0 ? (
        <Card title={strings.loadDetail.holds} elevated>
          <Text style={styles.holdsNote}>{strings.loadDetail.holdsNote}</Text>
          {load.active_holds.map((holdKey) => (
            <Text key={holdKey} style={styles.holdItem}>
              · {formatHoldLabel(holdKey)}
            </Text>
          ))}
        </Card>
      ) : null}

      <Card title={strings.loadDetail.route} elevated>
        <LoadDetailRow
          label={strings.loadDetail.pickup}
          value={formatDisplayValue(load.pickup_location)}
        />
        <LoadDetailMeta>
          {formatAppointmentRange(load.pickup_apt_from, load.pickup_apt_to)}
        </LoadDetailMeta>
        <LoadDetailRow
          label={strings.loadDetail.delivery}
          value={formatDisplayValue(load.delivery_location)}
        />
        <LoadDetailMeta>
          {formatAppointmentRange(load.delivery_apt_from, load.delivery_apt_to)}
        </LoadDetailMeta>
        {load.return_location ? (
          <LoadDetailRow
            label={strings.loadDetail.returnEmpty}
            value={formatDisplayValue(load.return_location)}
          />
        ) : null}
        {load.customer_name ? (
          <LoadDetailRow label={strings.loadDetail.customer} value={load.customer_name} />
        ) : null}
        {load.customer_phone ? (
          <LoadDetailRow label={strings.loadDetail.customerPhone} value={load.customer_phone} />
        ) : null}
        {load.customer_address ? (
          <LoadDetailRow
            label={strings.loadDetail.customerAddress}
            value={load.customer_address}
            last
          />
        ) : null}
      </Card>

      <Card title={strings.location.sectionTitle} elevated>
        <LoadLocationSection
          loadReference={load.reference_number}
          loadStatus={load.status}
          containerNumber={load.container_number}
          pickupLocation={load.pickup_location}
          deliveryLocation={load.delivery_location}
          driverName={load.driver_name}
          driverPhone={load.driver_phone}
        />
      </Card>

      {hasShipmentInfo(load) ? (
        <Card title={strings.loadDetail.shipment} elevated>
          {load.load_type ? (
            <LoadDetailRow label={strings.loadDetail.loadType} value={load.load_type} />
          ) : null}
          {load.route_type ? (
            <LoadDetailRow label={strings.loadDetail.routeType} value={load.route_type} />
          ) : null}
          {load.ssl ? <LoadDetailRow label={strings.loadDetail.ssl} value={load.ssl} /> : null}
          {load.mbol ? <LoadDetailRow label={strings.loadDetail.mbol} value={load.mbol} /> : null}
          {load.house_bol ? (
            <LoadDetailRow label={strings.loadDetail.houseBol} value={load.house_bol} last />
          ) : null}
        </Card>
      ) : null}

      {hasContainerInfo(load) ? (
        <Card title={strings.loadDetail.container} elevated>
          {load.container_number ? (
            <LoadDetailRow label={strings.loadDetail.container} value={load.container_number} />
          ) : null}
          {load.container_size ? (
            <LoadDetailRow label={strings.loadDetail.containerSize} value={load.container_size} />
          ) : null}
          {load.container_type ? (
            <LoadDetailRow label={strings.loadDetail.containerType} value={load.container_type} />
          ) : null}
          {load.bol_number ? (
            <LoadDetailRow label={strings.loadDetail.bolNumber} value={load.bol_number} />
          ) : null}
          {load.seal_number ? (
            <LoadDetailRow label={strings.loadDetail.sealNumber} value={load.seal_number} />
          ) : null}
          {load.chassis_number ? (
            <LoadDetailRow label={strings.loadDetail.chassis} value={load.chassis_number} last />
          ) : null}
        </Card>
      ) : null}

      {hasTimeline(load) ? (
        <Card title={strings.loadDetail.timeline} elevated>
          {load.scheduled_pickup ? (
            <LoadDetailRow
              label={strings.loadDetail.scheduledPickup}
              value={formatAppointment(load.scheduled_pickup)}
            />
          ) : null}
          {load.actual_pickup ? (
            <LoadDetailRow
              label={strings.loadDetail.actualPickup}
              value={formatAppointment(load.actual_pickup)}
            />
          ) : null}
          {load.actual_delivery ? (
            <LoadDetailRow
              label={strings.loadDetail.actualDelivery}
              value={formatAppointment(load.actual_delivery)}
            />
          ) : null}
          {load.completed_date ? (
            <LoadDetailRow
              label={strings.loadDetail.completed}
              value={formatAppointment(load.completed_date)}
              last
            />
          ) : null}
        </Card>
      ) : null}

      {hasLoadFlags(load) ? (
        <Card title={strings.loadDetail.flags} elevated>
          <LoadDetailRow
            label={strings.loadDetail.hazmat}
            value={load.is_hazmat ? strings.loadDetail.yes : strings.loadDetail.no}
          />
          <LoadDetailRow
            label={strings.loadDetail.overweight}
            value={load.is_overweight ? strings.loadDetail.yes : strings.loadDetail.no}
          />
          <LoadDetailRow
            label={strings.loadDetail.bonded}
            value={load.is_bonded ? strings.loadDetail.yes : strings.loadDetail.no}
            last
          />
        </Card>
      ) : null}

      {load.notes ? (
        <Card title={strings.loadDetail.notes} elevated>
          <Text style={styles.notes}>{load.notes}</Text>
        </Card>
      ) : null}

      <Card title={strings.loadDetail.messages} elevated>
        <Text style={styles.muted}>{strings.loadDetail.noMessages}</Text>
      </Card>

      <Card title={strings.loadDetail.pod} elevated>
        <LoadDocumentsSection
          documents={documents}
          loading={documentsLoading}
          error={documentsError}
          onRetry={onDocumentsRetry}
          onRefreshDocuments={onRefreshDocuments}
          onUploadDocument={onUploadDocument}
        />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  holdsNote: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.sm,
  },
  holdItem: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.warning,
    marginTop: 4,
  },
  notes: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    lineHeight: 22,
  },
  muted: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
  },
});
