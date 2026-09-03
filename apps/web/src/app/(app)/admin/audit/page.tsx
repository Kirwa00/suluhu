'use client';

import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeading } from '@/components/app/stat-card';
import { analyticsApi } from '@/lib/api/analytics-api';
import { formatDateTimeEAT } from '@/lib/format';
import { useT } from '@/i18n/locale-context';

export default function AdminAuditPage() {
  const t = useT();
  const [action, setAction] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit', query, page],
    queryFn: () => analyticsApi.auditLog({ action: query || undefined, page }),
  });

  return (
    <div>
      <PageHeading title={t('audit.title')} subtitle={t('audit.subtitle')} />

      <form
        className="mb-4 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(action.trim());
        }}
      >
        <Input
          placeholder={t('audit.filterPlaceholder')}
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <Button type="submit">{t('audit.filter')}</Button>
      </form>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-on-surface-variant">{t('common.loading')}</p>
          ) : !data || data.items.length === 0 ? (
            <p className="p-6 text-sm text-on-surface-variant">{t('audit.empty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-on-surface-variant">
                  <th className="p-3 font-medium">{t('audit.table.when')}</th>
                  <th className="p-3 font-medium">{t('audit.table.actor')}</th>
                  <th className="p-3 font-medium">{t('audit.table.action')}</th>
                  <th className="p-3 font-medium">{t('audit.table.resource')}</th>
                  <th className="p-3 font-medium">{t('audit.table.phi')}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant last:border-0">
                    <td className="whitespace-nowrap p-3 text-on-surface-variant">
                      {formatDateTimeEAT(r.createdAt)}
                    </td>
                    <td className="p-3 text-on-surface">{r.actor}</td>
                    <td className="p-3">
                      <code className="text-xs text-tertiary">{r.action}</code>
                    </td>
                    <td className="p-3 text-on-surface-variant">{r.resourceType}</td>
                    <td className="p-3">
                      {r.phiAccessed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-secondary">
                          <ShieldCheck className="h-3 w-3" /> PHI
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">
            {t('audit.pagination', {
              page: data.pagination.page,
              totalPages: data.pagination.totalPages,
              totalItems: data.pagination.totalItems,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={!data.pagination.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              {t('audit.previous')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!data.pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('audit.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
