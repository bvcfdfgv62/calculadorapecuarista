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
    
    const PROP_H = 22
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

    // Linha de conteúdo do Card (Organizada em 3 colunas de dados)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_SECONDARY)
    doc.text('PROPRIETÁRIO / FAZENDA', 18.5, y + 6)
    doc.text('LOCALIZAÇÃO', 108.5, y + 6)
    doc.text('CONTATO / RESPONSÁVEL', 153.5, y + 6)

    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_PRIMARY)
    doc.text(owner.substring(0, 45), 18.5, y + 11)
    doc.text(loc.substring(0, 30), 108.5, y + 11)
    doc.text(phone.substring(0, 20), 153.5, y + 11)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLOR_SECONDARY)
    doc.text(`Fazenda: ${inputs.propertyData?.farmName || 'Não Informada'}`, 18.5, y + 16.5)
    if (email) {
        doc.text(email.substring(0, 30), 153.5, y + 16.5)
    }

    y += PROP_H + 7.5

    // ─── 02. PARÂMETROS ANALÍTICOS (COLUNAS SIMÉTRICAS) ────────────────────────
    drawSectionHeader('02. Parâmetros Analíticos')
    
    const PANEL_H = 43
    doc.setFillColor(COLOR_BG_LIGHT)
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.15)
    doc.roundedRect(15, y, 180, PANEL_H, 2, 2, 'FD')

    // Coluna 1: Pastagem
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_EMERALD)
    doc.text('MANEJO DA PASTAGEM', 18.5, y + 6)
    
    const pastagemParams = [
        { label: 'Área Amostral:', value: `${inputs.sampleArea} m²` },
        { label: 'Peso Verde da Amostra:', value: `${(inputs.sampleWeight * 1000).toFixed(0)} g` },
        { label: 'Teor de Matéria Seca (MS):', value: `${inputs.dryMatterPercent}%` },
        { label: 'Oferta de Forragem (OF):', value: `${inputs.forageSupplyPercent}% do PV` },
        { label: 'Perda por Indisponibilidade:', value: `${inputs.unavailabilityPercent}%` }
    ]
    
    pastagemParams.forEach((p, idx) => {
        const py = y + 13 + idx * 6.5
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(COLOR_SECONDARY)
        doc.text(p.label, 18.5, py)
        
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLOR_PRIMARY)
        doc.text(p.value, 68, py)
    })
    
    // Coluna 2: Dados do Rebanho
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_EMERALD)
    doc.text('DADOS DO REBANHO', 110, y + 6)
    
    const rebanhoParams = [
        { label: 'Categoria de Gado:', value: catText },
        { label: 'Peso Corporal Médio:', value: `${inputs.bodyWeight} kg` },
        { label: 'Ganho de Peso Diário (GPD):', value: `${inputs.gpd} kg/dia` },
        { label: 'Período de Pastejo:', value: `${inputs.growthPeriod} dias` },
        { label: 'Dias de Ocupação:', value: `${inputs.occupationDays} dias` }
    ]
    
    rebanhoParams.forEach((r, idx) => {
        const py = y + 13 + idx * 6.5
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(COLOR_SECONDARY)
        doc.text(r.label, 110, py)
        
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLOR_PRIMARY)
        doc.text(r.value, 168, py)
    })

    y += PANEL_H + 7.5

    // ─── 03. RESULTADOS TÉCNICOS (DASHBOARD SYMMETRIC PANEL) ───────────────────
    drawSectionHeader('03. Resultados Técnicos')

    const kpis = [
        { label: 'MASSA DE FORRAGEM', value: `${outputs.forageMass.toFixed(0)} kg MS/ha`, desc: 'Disponibilidade de pasto' },
        { label: 'CAPACIDADE SUPORTE', value: `${outputs.supportCapacity.toFixed(0)} kg PV/ha`, desc: 'Carga recomendada' },
        { label: 'TAXA DE LOTAÇÃO', value: `${outputs.stockingRateUA.toFixed(2)} UA/ha`, desc: 'UA por hectare útil' },
        { label: 'PRODUTIVIDADE', value: `${outputs.productivity.toFixed(1)} @ / ha`, desc: 'Arrobas no período' }
    ]
    
    const panelY = y
    const KPI_PANEL_H = 22
    doc.setFillColor('#FFFFFF')
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.15)
    doc.roundedRect(15, panelY, 180, KPI_PANEL_H, 1.5, 1.5, 'FD')
    
    // Divisores verticais
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.15)
    doc.line(60, panelY + 3, 60, panelY + KPI_PANEL_H - 3)
    doc.line(105, panelY + 3, 105, panelY + KPI_PANEL_H - 3)
    doc.line(150, panelY + 3, 150, panelY + KPI_PANEL_H - 3)
    
    // Conteúdo dos KPIs
    const colX = [18.5, 63.5, 108.5, 153.5]
    kpis.forEach((k, idx) => {
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLOR_SECONDARY)
        doc.text(k.label, colX[idx], panelY + 6)
        
        doc.setFontSize(11.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLOR_PRIMARY)
        doc.text(k.value, colX[idx], panelY + 12.5)
        
        doc.setFontSize(7)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(COLOR_MUTED)
        doc.text(k.desc, colX[idx], panelY + 17.5)
    })

    y += KPI_PANEL_H + 7.5

    // ─── 04. DEMONSTRAÇÃO FINANCEIRA (DRE CORPORATIVA) ────────────────────────
    drawSectionHeader('04. Demonstrativo de Resultados Financeiros (DRE)')

    const DRE_H = 42
    doc.setFillColor(COLOR_BG_LIGHT)
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.15)
    doc.roundedRect(15, y, 180, DRE_H, 2, 2, 'FD')
    
    // Cabeçalhos da Tabela
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_SECONDARY)
    doc.text('CONTA / DESCRIÇÃO DO RESULTADO', 20, y + 6)
    doc.text('INDICAÇÃO E TAXA', 105, y + 6)
    doc.text('VALOR ESTIMADO', 190, y + 6, { align: 'right' })
    
    doc.setDrawColor(COLOR_BORDER)
    doc.setLineWidth(0.1)
    doc.line(20, y + 8, 190, y + 8)
    
    // Linha 1: Faturamento
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_PRIMARY)
    doc.text('Faturamento Bruto Projetado', 20, y + 14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLOR_SECONDARY)
    doc.text('100.0% da receita a pasto', 105, y + 14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_PRIMARY)
    doc.text(money(outputs.revenue), 190, y + 14, { align: 'right' })
    
    // Linha 2: Deduções
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_PRIMARY)
    doc.text('(-) Deduções & Perdas de Pastagem', 20, y + 21)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLOR_SECONDARY)
    doc.text(`${inputs.unavailabilityPercent}% de taxa de indisponibilidade`, 105, y + 21)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_RED)
    doc.text(`- ${money(outputs.reduction)}`, 190, y + 21, { align: 'right' })
    
    // Linha divisória de totalização
    doc.setDrawColor(COLOR_EMERALD)
    doc.setLineWidth(0.2)
    doc.line(20, y + 25, 190, y + 25)
    
    // Linha 3: Lucro Líquido
    doc.setFontSize(10.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_EMERALD)
    doc.text('(=) LUCRO LÍQUIDO PROJETADO', 20, y + 32)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Preço de Ref: R$/@ ${inputs.pricePerArroba?.toFixed(2) ?? '-'}`, 105, y + 32)
    
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLOR_EMERALD)
    doc.text(money(outputs.profit), 190, y + 32, { align: 'right' })

    y += DRE_H + 7.5

    // ─── NOTA METODOLÓGICA ───────────────────────────────────────────────────
    const noteText = 'Nota Metodológica: Esta simulação técnica utiliza as diretrizes científicas da Embrapa Pecuária Sul para cálculo da capacidade de suporte e consumo diário de matéria seca. Os resultados financeiros representam estimativas baseadas nos coeficientes produtivos fornecidos pelo produtor e nas condições atuais de mercado, não constituindo garantia de faturamento ou receita futura.'
    
    doc.setFillColor(COLOR_BG_LIGHT)
    doc.rect(15, y, 180, 16, 'F')

    doc.setFont('helvetica', 'oblique')
    doc.setFontSize(8.5)
    doc.setTextColor(COLOR_SECONDARY)
    doc.text(noteText, 18.5, y + 5, { maxWidth: 173, align: 'justify' })

    y = 254

    // ─── ASSINATURAS E VALIDAÇÃO ─────────────────────────────────────────────
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
