import OpenAI from 'openai';

interface ESGReportData {
    surveyTitle: string;
    totalResponses: number;
    matrixData: Array<{
        name: string;
        internalAvg: number;
        externalAvg: number;
    }>;
    stakeholderData: Array<{
        groupName: string;
        averages: Record<string, number>;
    }>;
}

const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    return new OpenAI({ apiKey });
};

export const generateESGReport = async (data: ESGReportData): Promise<string> => {

    try {
        const openai = getOpenAIClient();

        const prompt = buildPrompt(data);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an ESG (Environmental, Social, Governance) analyst expert. 
You analyze materiality assessment data from stakeholder surveys and provide actionable insights.
Your reports should be professional, data-driven, and formatted in clean markdown.
Focus on identifying priority areas, stakeholder alignment/misalignment, and strategic recommendations.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        console.log('AI Report Generated Successfully');
        return content;

    } catch (error: any) {
        console.error('AI Report Generation Failed:', error.message);

        return generateFallbackReport(data);
    }
};

const buildPrompt = (data: ESGReportData): string => {
    const matrixSummary = data.matrixData.map(kpi =>
        `- **${kpi.name}**: Internal Avg = ${kpi.internalAvg}/10, External Avg = ${kpi.externalAvg}/10`
    ).join('\n');

    const stakeholderSummary = data.stakeholderData.map(group => {
        const kpiRatings = Object.entries(group.averages)
            .map(([kpi, score]) => `  - ${kpi}: ${score}/10`)
            .join('\n');
        return `**${group.groupName}**:\n${kpiRatings}`;
    }).join('\n\n');

    const topPriorities = data.matrixData
        .filter(kpi => kpi.internalAvg > 7 && kpi.externalAvg > 7)
        .map(kpi => kpi.name);

    const misalignments = data.matrixData
        .filter(kpi => Math.abs(kpi.internalAvg - kpi.externalAvg) > 2)
        .map(kpi => ({
            name: kpi.name,
            internal: kpi.internalAvg,
            external: kpi.externalAvg,
            gap: Math.abs(kpi.internalAvg - kpi.externalAvg)
        }));

    return `
## ESG Materiality Survey Analysis Request

**Survey:** ${data.surveyTitle}
**Total Responses:** ${data.totalResponses}

### KPI Ratings Summary (Internal vs External Stakeholders)
${matrixSummary}

### Stakeholder Group Breakdown
${stakeholderSummary}

### Pre-identified Patterns
- **High Priority KPIs (both stakeholder groups rate >7):** ${topPriorities.length > 0 ? topPriorities.join(', ') : 'None identified'}
- **Misalignment Areas (>2 point gap):** ${misalignments.length > 0 ? misalignments.map(m => `${m.name} (gap: ${m.gap.toFixed(1)})`).join(', ') : 'None identified'}

---

Please generate a comprehensive ESG Materiality Assessment Report with the following sections:

1. **Executive Summary** - Brief overview of key findings (2-3 sentences)
2. **Priority Material Topics** - KPIs that both internal and external stakeholders consider most important
3. **Stakeholder Alignment Analysis** - Where do internal vs external stakeholders agree/disagree?
4. **Gap Analysis** - Significant differences between stakeholder perspectives and what they might indicate
5. **Strategic Recommendations** - 3-5 actionable recommendations for the organization
6. **Risk Considerations** - Potential ESG risks based on low-rated but important KPIs

Format the report in clean markdown with headers and bullet points. Be specific and reference the actual data provided.
`;
};

const generateFallbackReport = (data: ESGReportData): string => {
    const topPriorities = data.matrixData
        .filter(kpi => kpi.internalAvg > 7 && kpi.externalAvg > 7)
        .map(kpi => kpi.name);

    const misalignments = data.matrixData
        .filter(kpi => Math.abs(kpi.internalAvg - kpi.externalAvg) > 2);

    let report = `## Materiality Assessment Summary\n\n`;
    report += `**Survey:** ${data.surveyTitle}\n`;
    report += `**Total Responses:** ${data.totalResponses}\n\n`;

    report += `### 🚨 Top Priority Areas\n`;
    if (topPriorities.length > 0) {
        report += `Based on the analysis, the following areas are considered critical by both internal and external stakeholders:\n`;
        topPriorities.forEach(p => report += `- **${p}**\n`);
    } else {
        report += `No shared high-priority areas identified (>7/10 by both groups). Stakeholders have divergent views.\n`;
    }

    report += `\n### 📊 Stakeholder Alignment\n`;
    if (misalignments.length > 0) {
        report += `The following KPIs show significant differences between internal and external stakeholder ratings:\n`;
        misalignments.forEach(m => {
            const direction = m.internalAvg > m.externalAvg ? 'Internal rates higher' : 'External rates higher';
            report += `- **${m.name}**: Gap of ${Math.abs(m.internalAvg - m.externalAvg).toFixed(1)} points (${direction})\n`;
        });
    } else {
        report += `Internal and external stakeholders are generally aligned on KPI priorities.\n`;
    }

    report += `\n### 💡 Recommendation\n`;
    report += `Focus on bridging perception gaps by engaging stakeholder groups in dialogue about ESG priorities.\n`;

    report += `\n---\n*Note: AI-powered insights unavailable. This is a basic statistical analysis.*`;

    return report;
};
