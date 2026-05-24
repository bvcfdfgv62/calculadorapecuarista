import jsPDF from 'jspdf'
import type { CalculatorInputs, CalculatorOutputs } from './calculator'

const GREEN_PRIMARY = '#006A4E' // Corteva Green
const TEXT_DARK = '#1F2937'     // Gray 800
const TEXT_MUTED = '#6B7280'    // Gray 500
const BORDER_COLOR = '#E5E7EB'  // Gray 200

function formatMoney(v: number) {
    return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

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
            if (d[i] > 240 && d[i + 1] > 240 && d[i + 2] > 240) d[i + 3] = 0
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
    const date = new Date().toLocaleDateString('pt-BR')
    const logo = await loadLogoTransparent('/logo-corteva.png')

    // --- HEADER ---
    if (logo) {
        const LOGO_H = 15
        const LOGO_W = Math.min(LOGO_H * logo.w / logo.h, 60)
        doc.addImage(logo.dataUrl, 'PNG', 15, 15, LOGO_W, LOGO_H)
    }

    doc.setTextColor(TEXT_DARK)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório de Simulação de Pastagem', 195, 22, { align: 'right' })

    doc.setTextColor(TEXT_MUTED)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Data da Simulação: ${date}`, 195, 27, { align: 'right' })

    doc.setDrawColor(BORDER_COLOR)
    doc.setLineWidth(0.5)
    doc.line(15, 35, 195, 35)

    let y = 45

    const addSectionTitle = (title: string) => {
        doc.setTextColor(GREEN_PRIMARY)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(title.toUpperCase(), 15, y)
        doc.setDrawColor(GREEN_PRIMARY)
        doc.setLineWidth(0.3)
        doc.line(15, y + 2, 195, y + 2)
        y += 10
    }

    // --- DADOS DA PROPRIEDADE ---
    addSectionTitle('Identificação')
    
    doc.setTextColor(TEXT_DARK)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Fazenda:', 15, y)
    doc.setFont('helvetica', 'normal')
    doc.text(inputs.propertyData?.farmName || 'Não informado', 40, y)

    doc.setFont('helvetica', 'bold')
    doc.text('Proprietário:', 15, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.text(inputs.propertyData?.owner || 'Não informado', 40, y + 6)

    const city = inputs.propertyData?.city || ''
    const state = inputs.propertyData?.state || ''
    const loc = city && state ? `${city} / ${state}` : 'Não informado'
    
    doc.setFont('helvetica', 'bold')
    doc.text('Localização:', 110, y)
    doc.setFont('helvetica', 'normal')
    doc.text(loc, 135, y)

    doc.setFont('helvetica', 'bold')
    doc.text('Contato:', 110, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.text(inputs.propertyData?.phone || 'Não informado', 135, y + 6)

    y += 18

    // --- PARÂMETROS UTILIZADOS ---
    addSectionTitle('Parâmetros Técnicos')

    const categories: Record<string, string> = {
        'Bezerro': 'Bezerro / Bezerra',
        'Novilha': 'Garrote / Novilha',
        'BoiGordo': 'Boi Gordo / Touro',
        'VacaCria': 'Vaca de Cria',
        'VacaSeca': 'Vaca Seca / Solteira'
    }
    const catText = categories[inputs.category] || inputs.category

    const col1 = [
        { label: 'Área Amostral:', val: `${inputs.sampleArea} m²` },
        { label: 'Peso Verde Colhido:', val: `${(inputs.sampleWeight * 1000).toFixed(0)} g` },
        { label: 'Matéria Seca (MS):', val: `${inputs.dryMatterPercent}%` },
        { label: 'Oferta de Forragem:', val: `${inputs.forageSupplyPercent}%` },
        { label: 'Perda/Indisponível:', val: `${inputs.unavailabilityPercent}%` }
    ]

    const col2 = [
        { label: 'Categoria Animal:', val: catText },
        { label: 'Peso Médio (PV):', val: `${inputs.bodyWeight} kg` },
        { label: 'Ganho Diário (GPD):', val: `${inputs.gpd} kg/dia` },
        { label: 'Período Total:', val: `${inputs.growthPeriod} dias` },
        { label: 'Dias Ocupação:', val: `${inputs.occupationDays} dias` }
    ]

    doc.setFontSize(9)
    for (let i = 0; i < Math.max(col1.length, col2.length); i++) {
        if (col1[i]) {
            doc.setFont('helvetica', 'bold')
            doc.text(col1[i].label, 15, y)
            doc.setFont('helvetica', 'normal')
            doc.text(col1[i].val, 60, y)
        }
        if (col2[i]) {
            doc.setFont('helvetica', 'bold')
            doc.text(col2[i].label, 110, y)
            doc.setFont('helvetica', 'normal')
            doc.text(col2[i].val, 155, y)
        }
        y += 6
    }
    y += 8

    // --- RESULTADOS ZOOTÉCNICOS ---
    addSectionTitle('Resultados Zootécnicos')

    const results = [
        { label: 'Massa de Forragem', val: `${outputs.forageMass.toFixed(0)} kg MS/ha` },
        { label: 'Capacidade de Suporte', val: `${outputs.supportCapacity.toFixed(0)} kg PV/ha` },
        { label: 'Taxa de Lotação (UA)', val: `${outputs.stockingRateUA.toFixed(2)} UA/ha` },
        { label: 'Taxa de Lotação (Cab)', val: `${outputs.stockingRateHeads.toFixed(1)} cabeças/ha` },
        { label: 'Produtividade Estimada', val: `${outputs.productivity.toFixed(1)} @/ha` }
    ]

    // Create a clean zebra table
    doc.setDrawColor(BORDER_COLOR)
    doc.setLineWidth(0.1)
    
    results.forEach((row, i) => {
        if (i % 2 === 0) {
            doc.setFillColor('#F9FAFB') // Gray 50
            doc.rect(15, y - 4, 180, 8, 'F')
        }
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(TEXT_DARK)
        doc.text(row.label, 20, y + 1)
        
        doc.setFont('helvetica', 'bold')
        doc.text(row.val, 190, y + 1, { align: 'right' })
        y += 8
    })

    y += 10

    // --- RESULTADOS FINANCEIROS ---
    addSectionTitle('Projeção Financeira por Hectare')

    const fin = [
        { label: 'Receita Bruta Estimada', val: formatMoney(outputs.revenue) },
        { label: `Deduções Estimadas (${inputs.unavailabilityPercent}%)`, val: `- ${formatMoney(outputs.reduction)}` }
    ]

    fin.forEach((row, i) => {
        if (i % 2 === 0) {
            doc.setFillColor('#F9FAFB')
            doc.rect(15, y - 4, 180, 8, 'F')
        }
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(row.label, 20, y + 1)
        doc.setFont('helvetica', 'bold')
        if (row.val.startsWith('-')) doc.setTextColor('#DC2626')
        doc.text(row.val, 190, y + 1, { align: 'right' })
        doc.setTextColor(TEXT_DARK)
        y += 8
    })

    // Linha de total
    doc.setDrawColor(GREEN_PRIMARY)
    doc.setLineWidth(0.5)
    doc.line(15, y - 1, 195, y - 1)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(GREEN_PRIMARY)
    doc.text('Lucro Líquido Projetado', 20, y + 5)
    doc.text(formatMoney(outputs.profit), 190, y + 5, { align: 'right' })

    // --- FOOTER ---
    const pageHeight = doc.internal.pageSize.height
    
    doc.setDrawColor(BORDER_COLOR)
    doc.setLineWidth(0.5)
    doc.line(15, pageHeight - 25, 195, pageHeight - 25)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(TEXT_MUTED)
    doc.text('Nota: Valores calculados com base nas fórmulas agronômicas padrão da Embrapa.', 15, pageHeight - 20)
    doc.text('As estimativas financeiras dependem da precisão dos dados inseridos e variações de mercado.', 15, pageHeight - 16)
    
    doc.text('Calculadora Pecuarista © Corteva Agriscience', 195, pageHeight - 20, { align: 'right' })
    doc.text('Página 1', 195, pageHeight - 16, { align: 'right' })

    doc.save(`Relatorio_Pecuaria_${(farmName || 'Simulacao').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
}
