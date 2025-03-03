import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';
import { WebWidget, WebWidgetData } from '@/types/tables';
import { mockData } from '@/lib/mock-data';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { reportId } = req.body;
        const instance = Dataset.getInstance();

        try {
            const widgetQuery = `
                SELECT TOP 1 ReportID, ReportQuery, ReportQuery2
                FROM om_webWidgets
                WHERE ReportID = @reportId
                AND IsActive = 1
                AND (ReportQuery != '' OR ReportQuery2 != '')
                ORDER BY ReportIndex ASC
            `;

            const widget = await instance.executeQuery<WebWidget[]>({
                query: widgetQuery,
                parameters: {
                    reportId: parseInt(reportId)
                },
                req
            });

            if (!widget[0]) {
                throw new Error('Widget not found');
            }

            const result = await instance.executeQuery<WebWidgetData[]>({
                query: widget[0].ReportQuery?.toString() + "",
                parameters: req.body,
                req
            });
            return res.status(200).json(result);
        } catch (error) {
            console.warn('Database query failed, using mock data');
            return res.status(200).json(mockData.widgetData);
        }
    } catch (error: any) {
        console.warn('Using mock data due to error:', error);
        return res.status(200).json(mockData.widgetData);
    }
}