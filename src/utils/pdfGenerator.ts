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

    // Cores do Sistema de Design Premium
    const COLOR_PRIMARY = '#0F172A'       // Slate 900
    const COLOR_SECONDARY = '#475569'     // Slate 600
    const COLOR_MUTED = '#94A3B8'         // Slate 400
    const COLOR_BORDER = '#E2E8F0'        // Slate 200
    const COLOR_BG_LIGHT = '#F8FAFC'      // Slate 50
    const COLOR_EMERALD = '#065F46'       // Emerald 800 (Corteva Green)
    const COLOR_EMERALD_LIGHT = '#ECFDF5'  // Emerald 50
    const COLOR_EMERALD_TEXT = '#047857'   // Emerald 700
    const COLOR_RED = '#DC2626'           // Red 600

    // Carrega o logotipo
    const logo = await loadLogoTransparent('/logo-corteva.png')

    // ─── CABEÇALHO EDITORIAL ──────────────────────────────────────────────────
    // Traço vertical de acento verde (mais encorpado para harmonia visual)
    doc.setFillColor(COLOR_EMERALD)
    doc.rect(15, 15, 2, 22, 'F')

    // Título Principal (Maior para legibilidade)
    doc.setTextColor(COLOR_PRIMARY)
    doc.setFontSize(16.5)
    doc.setFont('helvetica', 'bold')
    doc.text('RELATÓRIO DE SIMULAÇÃO PECUÁRIA', 20, 21)

    // Subtítulo (Mais legível)
    doc.setTextColor(COLOR_SECONDARY)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Simulação Técnica de Viabilidade e Capacidade de Pastagem · Metodologia Embrapa', 20, 26)

    // Logotipo no canto superior direito (Massivo, altamente visível para consolidação da marca)
    const LOGO_H = 26
    const LOGO_W = logo ? Math.min(LOGO_H * logo.w / logo.h, 75) : 75
    if (logo) {
        doc.addImage(logo.dataUrl, 'PNG', 195 - LOGO_W, 13, LOGO_W, LOGO_H)
    }

    // Metadados do relatório (Maiores e em negrito para fácil leitura e acessibilidade)
    doc.setTextColor(COLOR_SECONDARY)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.text(`PROPRIEDADE: ${farmName || 'Simulação'}`, 20, 36)
    doc.text(`DATA: ${date}`, 115, 36)

    // Divisor fino inferior do cabeçalho
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.2)
    doc.line(15, 42.5, 195, 42.5)

    let y = 48.5

    // ─── HELPERS DE DESIGN ───────────────────────────────────────────────────
    const drawSectionHeader = (title: string) => {
        doc.setFillColor(COLOR_EMERALD)
        doc.rect(15, y, 3, 3, 'F')

        doc.setTextColor(COLOR_PRIMARY)
        doc.setFontSize(9.5)
        doc.setFont('helvetica', 'bold')
        doc.text(title.toUpperCase(), 20, y + 2.5)
        y += 6
    }

    // ─── 01. DADOS DA PROPRIEDADE ─────────────────────────────────────────────
    drawSectionHeader('01. Dados da Propriedade')
    
    // Card de Dados da Propriedade (Ampliado para acomodar fontes maiores de acessibilidade)
    const PROP_H = 26
    doc.setFillColor(COLOR_BG_LIGHT)
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.15)
    doc.roundedRect(15, y, 180, PROP_H, 2, 2, 'FD')

    const owner = inputs.propertyData?.owner || 'Não informado'
    const city = inputs.propertyData?.city || ''
    const state = inputs.propertyData?.state || ''
    const loc = city && state ? `${city} / ${state}` : 'Não informado'
    const phone = inputs.propertyData?.phone || 'Não informado'
    const email = inputs.propertyData?.email || 'Não informado'

    // Linha 1 do Card (Fontes ampliadas e em negrito forte)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_SECONDARY)
    doc.text('PROPRIETÁRIO', 18.5, y + 6)
    doc.text('LOCALIZAÇÃO', 108.5, y + 6)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_PRIMARY)
    doc.text(owner.substring(0, 50), 18.5, y + 10.5)
    doc.text(loc.substring(0, 50), 108.5, y + 10.5)

    // Linha 2 do Card
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_SECONDARY)
    doc.text('CONTATO', 18.5, y + 16.5)
    doc.text('E-MAIL DE CONTATO', 108.5, y + 16.5)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_PRIMARY)
    doc.text(phone.substring(0, 50), 18.5, y + 21)
    doc.text(email.substring(0, 50), 108.5, y + 21)

    y += PROP_H + 7.5

    // ─── 02. PARÂMETROS DA PASTAGEM ───────────────────────────────────────────
    drawSectionHeader('02. Parâmetros da Pastagem')

    // Card em Grid de 5 colunas x 2 linhas (Ampliado para tamanho 32mm)
    const PARAM_H = 32
    doc.setFillColor(COLOR_BG_LIGHT)
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.15)
    doc.roundedRect(15, y, 180, PARAM_H, 2, 2, 'FD')

    const colsX = [18.5, 54.5, 90.5, 126.5, 162.5]

    // Row 1 (Legibilidade máxima das informações de pasto)
    const pRow1 = [
        { label: 'ÁREA AMOSTRAL', value: `${inputs.sampleArea} m²` },
        { label: 'PESO AMOSTRA', value: `${inputs.sampleWeight} kg` },
        { label: 'MATÉRIA SECA', value: `${inputs.dryMatterPercent}%` },
        { label: 'OFERTA FORRAGEM', value: `${inputs.forageSupplyPercent}%` },
        { label: 'PESO VIVO', value: `${inputs.bodyWeight} kg` }
    ]

    pRow1.forEach((item, idx) => {
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLOR_SECONDARY)
        doc.text(item.label, colsX[idx], y + 6.5)

        doc.setFontSize(10.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLOR_PRIMARY)
        doc.text(item.value, colsX[idx], y + 12)
    })

    // Row 2
    const categoryLabels: Record<string, string> = {
        'Bezerro': 'Bezerro/a',
        'Novilha': 'Novilha/Garrote',
        'BoiGordo': 'Boi Gordo/Touro',
        'VacaCria': 'Vaca de Cria',
        'VacaSeca': 'Vaca Seca'
    }
    const catText = categoryLabels[inputs.category] || 'Não Inf.'

    const pRow2 = [
        { label: 'GPD ESPERADO', value: `${inputs.gpd} kg/dia` },
        { label: 'CATEGORIA GADO', value: catText },
        { label: 'DIAS OCUPAÇÃO', value: `${inputs.occupationDays} dias` },
        { label: 'PERÍODO ENGORDA', value: `${inputs.growthPeriod} dias` },
        { label: '% INDISPONIB.', value: `${inputs.unavailabilityPercent}%` }
    ]

    pRow2.forEach((item, idx) => {
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLOR_SECONDARY)
        doc.text(item.label, colsX[idx], y + 19.5)

        doc.setFontSize(10.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLOR_PRIMARY)
        doc.text(item.value, colsX[idx], y + 25)
    })

    y += PARAM_H + 7.5

    // ─── 03. RESULTADOS TÉCNICOS ─────────────────────────────────────────────
    drawSectionHeader('03. Resultados Técnicos')

    const kpis = [
        { label: 'MASSA DE FORRAGEM', value: `${outputs.forageMass.toFixed(0)} kg MS/ha` },
        { label: 'CAPACIDADE SUPORTE', value: `${outputs.supportCapacity.toFixed(1)} kg PV/ha` },
        { label: 'TAXA DE LOTAÇÃO', value: `${outputs.stockingRateUA.toFixed(2)} UA/ha` },
        { label: 'PRODUTIVIDADE PERÍODO', value: `${outputs.productivity.toFixed(1)} @ / ha` },
    ]

    const cardW = 42
    const cardH = 26
    const gap = 4

    kpis.forEach((k, idx) => {
        const x0 = 15 + idx * (cardW + gap)
        
        // Card Background & Border
        doc.setFillColor('#FFFFFF')
        doc.setDrawColor(COLOR_BORDER)
        doc.setLineWidth(0.15)
        doc.roundedRect(x0, y, cardW, cardH, 1.5, 1.5, 'FD')

        // Traço lateral verde acento
        doc.setFillColor(COLOR_EMERALD)
        doc.rect(x0, y, 1.5, cardH, 'F')

        // Label
        doc.setTextColor(COLOR_SECONDARY)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(k.label, x0 + 4, y + 7.5)

        // Value (Grandes, pretos e destacados para leitura sob baixa visão)
        doc.setTextColor(COLOR_PRIMARY)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text(k.value, x0 + 4, y + 18.5)
    })

    y += cardH + 7.5

    // ─── 04. ESTIMATIVA FINANCEIRA ────────────────────────────────────────────
    drawSectionHeader('04. Estimativa Financeira')

    // Metade Esquerda: White Panel Card para Receita & Deduções (Ampliado para FIN_H = 32)
    const FIN_W_LEFT = 95
    const FIN_H = 32
    doc.setFillColor('#FFFFFF')
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.15)
    doc.roundedRect(15, y, FIN_W_LEFT, FIN_H, 2, 2, 'FD')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_SECONDARY)
    doc.text('FATURAMENTO BRUTO', 20, y + 8.5)
    doc.text('DEDUÇÕES PREVISTAS', 60, y + 8.5)

    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_PRIMARY)
    doc.text(money(outputs.revenue), 20, y + 20)
    
    doc.setTextColor(COLOR_RED)
    doc.text(`- ${money(outputs.reduction)}`, 60, y + 20)

    // Metade Direita: Emerald Solid Block Card para Lucro Líquido (Ultra-Destacado e Super Acessível!)
    const FIN_W_RIGHT = 81
    const xRight = 114
    doc.setFillColor(COLOR_EMERALD)
    doc.setDrawColor(COLOR_EMERALD)
    doc.roundedRect(xRight, y, FIN_W_RIGHT, FIN_H, 2, 2, 'FD')

    // Label Lucro Líquido
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_EMERALD_LIGHT)
    doc.text('LUCRO LÍQUIDO ESTIMADO', xRight + 5, y + 8.5)

    // Valor Lucro Líquido (Super Gigante de 18pt para visibilidade extrema!)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor('#FFFFFF')
    doc.text(money(outputs.profit), xRight + 5, y + 20)

    // Subtítulo de Referência
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`R$/@ ${inputs.pricePerArroba?.toFixed(2) ?? '-'}`, xRight + FIN_W_RIGHT - 5, y + 27, { align: 'right' })

    y += FIN_H + 7.5

    // ─── NOTA METODOLÓGICA ───────────────────────────────────────────────────
    const noteText = 'Nota Metodológica: Esta simulação técnica utiliza as diretrizes científicas da Embrapa Pecuária Sul para cálculo da capacidade de suporte e consumo diário de matéria seca. Os resultados financeiros representam estimativas baseadas nos coeficientes produtivos fornecidos pelo produtor e nas condições atuais de mercado, não constituindo garantia de faturamento ou receita futura.'
    
    // Fundo da nota técnica (mais espaçosa e perfeitamente legível)
    doc.setFillColor(COLOR_BG_LIGHT)
    doc.rect(15, y, 180, 16, 'F')

    doc.setFont('helvetica', 'oblique')
    doc.setFontSize(8.5)
    doc.setTextColor(COLOR_SECONDARY)
    doc.text(noteText, 18.5, y + 5, { maxWidth: 173, align: 'justify' })

    // PUSH SIGNATURES DOWN (empurra as assinaturas confortavelmente para a base da folha, agora com muito mais espaço!)
    y = 246

    // ─── ASSINATURAS E VALIDAÇÃO ─────────────────────────────────────────────
    // Linha do Produtor
    doc.setDrawColor(COLOR_MUTED)
    doc.setLineWidth(0.15)
    doc.line(25, y, 90, y)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(COLOR_PRIMARY)
    doc.text('PRODUTOR RESPONSÁVEL', 57.5, y + 5, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(COLOR_SECONDARY)
    doc.text(owner.substring(0, 30), 57.5, y + 9.5, { align: 'center' })

    // Linha do Responsável Técnico
    doc.line(120, y, 185, y)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(COLOR_PRIMARY)
    doc.text('RESPONSÁVEL TÉCNICO', 152.5, y + 5, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(COLOR_SECONDARY)
    doc.text('Calculadora Pecuária - Corteva', 152.5, y + 9.5, { align: 'center' })

    // ─── RODAPÉ INSTITUCIONAL ────────────────────────────────────────────────
    const FY = 283
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.15)
    doc.line(15, FY - 3, 195, FY - 3)

    doc.setTextColor(COLOR_SECONDARY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text('Calculadora Pecuarista · Desenvolvido em parceria com a Corteva Agriscience', 15, FY + 1.2)
    doc.text('Página 1 de 1', 195, FY + 1.2, { align: 'right' })

    // ─── DOWNLOAD ────────────────────────────────────────────────────────────
    doc.save(`Relatorio_${(farmName || 'Simulacao').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
}
