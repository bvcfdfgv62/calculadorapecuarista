import React from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts'

export const ChartCard = React.memo(({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
        className="rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-1.5 opacity-60" style={{ color: 'var(--muted)' }}>{title}</h3>
                <p className="text-lg font-black tracking-tighter uppercase" style={{ color: 'var(--foreground)' }}>{subtitle}</p>
            </div>
            <div className="p-3.5 bg-emerald-600/10 rounded-2xl text-emerald-600 border border-emerald-600/20">{icon}</div>
        </div>
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">{children as any}</ResponsiveContainer>
        </div>
    </motion.div>
))

export const OptimizedBarChart = React.memo(({ data, dataKey, colors }: any) => (
    <BarChart data={data} barSize={48} margin={{ left: -30, bottom: 20 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b8f7a', fontSize: 11, fontWeight: 900 }} dy={10} />
        <Tooltip
            cursor={{ fill: 'rgba(13,138,67,0.05)' }}
            contentStyle={{ backgroundColor: '#0d1710', border: '1px solid #1e3028', borderRadius: '16px', padding: '14px' }}
            itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '900' }}
            formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']}
        />
        <Bar dataKey={dataKey} radius={[12, 12, 0, 0]}>
            {data.map((entry: any, index: number) => (
                <Cell key={index} fill={entry.color || (colors && colors[index % colors.length])} />
            ))}
        </Bar>
    </BarChart>
))
