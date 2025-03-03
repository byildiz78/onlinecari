import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';
import { mockData } from '@/lib/mock-data';

interface AuditData {
    date: Date;
    branchName: string;
    formName: string;
    regionalManager: string;
    description: string;
    notes: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { branches } = req.body;

        if (!branches) {
            return res.status(400).json({ error: 'Branches parameter is required' });
        }

        const auditQuery = `
        SELECT TOP 20 
            wb.AuditDate AS date,
            wb.BranchName AS branchName,
            we.FormName AS formName,
            wb.RegionalManager AS regionalManager,
            wb.Descriptions AS description,
            wb.Notes AS notes
        FROM
            webBranchAuditRecords wb WITH (NOLOCK)
            INNER JOIN webBranchAuditForms we WITH (NOLOCK) ON wb.FormID = we.AutoID 
        WHERE
            wb.AuditDate >= DATEADD(HOUR, -24, GETDATE())
            AND wb.@BranchID
        ORDER BY
            wb.AuditDate DESC`;

        const instance = Dataset.getInstance();

        try {
            const results = await instance.executeQuery<AuditData[]>({
                query: auditQuery,
                parameters: {
                    BranchID: branches,
                },
                req
            });
            return res.status(200).json(results);
        } catch (error) {
            console.warn('Database query failed, using mock data');
            return res.status(200).json(mockData.recentAudits);
        }
    } catch (error: any) {
        console.warn('Using mock data due to error:', error);
        return res.status(200).json(mockData.recentAudits);
    }
}