import jsPDF from 'jspdf'
import type { CalculatorInputs, CalculatorOutputs } from './calculator'

const GREEN = '#0d7a3e'
const GREEN_DARK = '#186038'
const GREEN_LIGHT = '#f0faf4'
const GRAY_TEXT = '#444444'
const LIGHT_GRAY = '#f4f4f4'
const BORDER_GRAY = '#dddddd'

function money(v: number) {
    return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Returns dataURL + natural dimensions for correct aspect ratio */
async function loadLogoTransparent(url: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
    try {
        const img = await new Promise<HTMLImageElement>((res, rej) => {
            const i = new Image()
            i.crossOrigin = 'anonymous'
            i.onload = () => res(i)
            i.onerror = rej
            i.src = url
        })
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = data.data
        for (let i = 0; i < d.length; i += 4) {
            // Make near-white pixels transparent
            if (d[i] > 230 && d[i + 1] > 230 && d[i + 2] > 230) d[i + 3] = 0
        }
        ctx.putImageData(data, 0, 0)
        return { dataUrl: canvas.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight }
    } catch {
        return null
    }
}

export const generateProfessionalPDF = async (
    inputs: CalculatorInputs,
    outputs: CalculatorOutputs,
    farmName: string
) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = 210
    const date = new Date().toLocaleDateString('pt-BR')

    // Load logo with transparent background
    const logo = await loadLogoTransparent('/logo-corteva.png')

    // ─── HEADER ──────────────────────────────────────────────────────────────
    // Logo directly on green — correct aspect ratio from real image dimensions
    const LOGO_H = 36
    const LOGO_W = logo ? Math.min(LOGO_H * logo.w / logo.h, 90) : 90
    const HDR_H = LOGO_H + 12

    doc.setFillColor(GREEN)
    doc.rect(0, 0, W, HDR_H, 'F')

    if (logo) {
        const LX = W - LOGO_W - 10
        const LY = (HDR_H - LOGO_H) / 2
        doc.addImage(logo.dataUrl, 'PNG', LX, LY, LOGO_W, LOGO_H)
    }

    // Title left — constrained so it doesn't overlap logo area
    const maxTitleX = W - LOGO_W - 16
    doc.setTextColor('#ffffff')
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('RELATÓRIO DE SIMULAÇÃO PECUÁRIA', 12, 13, { maxWidth: maxTitleX })

    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`Propriedade: ${farmName || 'Simulação'}`, 12, 23)

    doc.setFontSize(7.5)
    doc.text(`Gerado em: ${date}`, 12, 30)

    let y = HDR_H + 10

    // ─── helpers ──────────────────────────────────────────────────────────────
    const section = (title: string) => {
        doc.setTextColor(GREEN)
        doc.setFontSize(10.5)
        doc.setFont('helvetica', 'bold')
        doc.text(title, 12, y)
        doc.setDrawColor(GREEN)
        doc.setLineWidth(0.4)
        doc.line(12, y + 1.5, W - 12, y + 1.5)
        y += 9
    }

    const row2 = (l1: string, v1: string, l2: string, v2: string) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(GRAY_TEXT)
        doc.text(`${l1}:`, 12, y)
        doc.setFont('helvetica', 'normal')
        // Truncate values that are too long
        doc.text(v1.substring(0, 36), 50, y)

        doc.setFont('helvetica', 'bold')
        doc.text(`${l2}:`, 105, y)
        doc.setFont('helvetica', 'normal')
        doc.text(v2.substring(0, 36), 143, y)
        y += 6.5
    }

    // ─── DADOS DA PROPRIEDADE ─────────────────────────────────────────────────
    section('DADOS DA PROPRIEDADE')
    row2('Proprietário', inputs.propertyData?.owner || '-', 'Localização', `${inputs.propertyData?.city || '-'} / ${inputs.propertyData?.state || '-'}`)
    row2('Contato', inputs.propertyData?.phone || '-', 'E-mail', inputs.propertyData?.email || '-')
    y += 3

    // ─── PARÂMETROS DA PASTAGEM ───────────────────────────────────────────────
    section('PARÂMETROS DA PASTAGEM')
    row2('Área Amostral', `${inputs.sampleArea} m²`, 'Peso Amostra', `${inputs.sampleWeight} kg`)
    row2('Matéria Seca', `${inputs.dryMatterPercent}%`, 'Oferta Forragem', `${inputs.forageSupplyPercent}%`)
    row2('Peso Vivo', `${inputs.bodyWeight} kg`, 'GPD Esperado', `${inputs.gpd} kg/dia`)
    row2('Nº Piquetes', `${inputs.paddockCount}`, 'Dias de Ocupação', `${inputs.occupationDays} dias`)
    row2('Período Engorda', `${inputs.growthPeriod} dias`, '% Indisponibilidade', `${inputs.unavailabilityPercent}%`)
    y += 3

    // ─── RESULTADOS TÉCNICOS (KPI 2×2) ───────────────────────────────────────
    section('RESULTADOS TÉCNICOS')
    const kpis = [
        { label: 'MASSA DE FORRAGEM', value: `${outputs.forageMass.toFixed(0)} kg MS/ha` },
        { label: 'CAPACIDADE SUPORTE', value: `${outputs.supportCapacity.toFixed(1)} kg PV/ha` },
        { label: 'TAXA DE LOTAÇÃO', value: `${outputs.stockingRateUA.toFixed(2)} UA/ha` },
        { label: 'PRODUTIVIDADE NO PERÍODO', value: `${outputs.productivity.toFixed(1)} @ / ha` },
    ]
    const cW = (W - 30) / 2, cH = 22, gap = 6
    kpis.forEach((k, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        const x0 = 12 + col * (cW + gap)
        const y0 = y + row * (cH + gap)
        doc.setFillColor(LIGHT_GRAY)
        doc.setDrawColor(BORDER_GRAY)
        doc.setLineWidth(0.3)
        doc.roundedRect(x0, y0, cW, cH, 2, 2, 'FD')
        // Top green accent
        doc.setFillColor(GREEN)
        doc.rect(x0, y0, cW, 2, 'F')
        doc.setTextColor('#888888')
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(k.label, x0 + 3, y0 + 8)
        doc.setTextColor('#111111')
        doc.setFontSize(12.5)
        doc.setFont('helvetica', 'bold')
        doc.text(k.value, x0 + 3, y0 + 18)
    })
    y += 2 * (cH + gap) + 4

    // ─── ESTIMATIVA FINANCEIRA ────────────────────────────────────────────────
    section('ESTIMATIVA FINANCEIRA')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(GRAY_TEXT)
    doc.text('Faturamento Bruto:', 12, y)
    doc.setFont('helvetica', 'normal')
    doc.text(money(outputs.revenue), 52, y)

    doc.setFont('helvetica', 'bold')
    doc.text('Deduções Previstas:', 105, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor('#cc3333')
    doc.text(`- ${money(outputs.reduction)}`, 143, y)
    y += 7

    // Lucro destaque
    doc.setFillColor(GREEN_DARK)
    doc.roundedRect(12, y, W - 24, 21, 3, 3, 'F')
    doc.setTextColor('#ffffff')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('LUCRO LÍQUIDO ESTIMADO', 17, y + 8)
    doc.setFontSize(15)
    doc.text(money(outputs.profit), 17, y + 17)
    doc.setFontSize(8.5)
    doc.text(`R$/@ ${inputs.pricePerArroba?.toFixed(2) ?? '-'}`, W - 16, y + 13, { align: 'right' })
    y += 26

    // ─── ANÁLISE DE CENÁRIOS ──────────────────────────────────────────────────
    section('ANÁLISE DE CENÁRIOS')
    const scenarios = [
        { name: 'Pessimista (- 15%)', rev: outputs.revenue * 0.85, profit: outputs.profit * 0.85 },
        { name: 'Médio (base)', rev: outputs.revenue, profit: outputs.profit },
        { name: 'Otimista (+ 15%)', rev: outputs.revenue * 1.15, profit: outputs.profit * 1.15 },
    ]
    const tcols = [14, 82, 148]
    const headers = ['Cenário', 'Receita Bruta', 'Lucro Estimado']

    doc.setFillColor(GREEN)
    doc.rect(12, y, W - 24, 8, 'F')
    headers.forEach((h, i) => {
        doc.setTextColor('#ffffff')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.text(h, tcols[i], y + 5.5)
    })
    y += 8

    scenarios.forEach((s, idx) => {
        doc.setFillColor(idx % 2 === 0 ? GREEN_LIGHT : '#ffffff')
        doc.rect(12, y, W - 24, 8, 'F')
        doc.setDrawColor(BORDER_GRAY)
        doc.setLineWidth(0.2)
        doc.line(12, y + 8, W - 12, y + 8)

        doc.setTextColor(GRAY_TEXT)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.text(s.name, tcols[0], y + 5.5)
        doc.setFont('helvetica', 'normal')
        doc.text(money(s.rev), tcols[1], y + 5.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(s.profit >= 0 ? GREEN : '#cc3333')
        doc.text(money(s.profit), tcols[2], y + 5.5)
        y += 8
    })

    // ─── FOOTER ───────────────────────────────────────────────────────────────
    const FY = 287
    doc.setFillColor(GREEN)
    doc.rect(0, FY, W, 10, 'F')

    if (logo) {
        doc.addImage(logo.dataUrl, 'PNG', 5, FY + 2, 26, 26 * logo.h / logo.w)
    }

    doc.setTextColor('#ffffff')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text('Calculadora Pecuarista · Metodologia Embrapa Pecuária Sul · Simulação técnica', W / 2, FY + 6, { align: 'center' })

    // ─── DOWNLOAD ─────────────────────────────────────────────────────────────
    doc.save(`Relatorio_${(farmName || 'Simulacao').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
}
