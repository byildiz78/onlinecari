import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';
import { mockData } from '@/lib/mock-data';

interface Notification {
   autoId: number;
   branchName: string;
   formName: string;
   orderDateTime: string;
   type: string;
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
       const auditQuery = `
       SELECT TOP 10
           wb.AuditID as autoId,
           wb.BranchName as branchName,
           we.FormName as formName,
           wb.AuditDate as orderDateTime,
           '1' as type
       FROM 
           webBranchAuditRecords wb WITH (NOLOCK)
           INNER JOIN webBranchAuditForms we WITH (NOLOCK) on wb.FormID = we.AutoID
       WHERE 
           wb.AuditDate >= DATEADD(HOUR, -24, GETDATE())
           AND wb.@BranchID
       ORDER BY 
           wb.AuditDate DESC`;

       const instance = Dataset.getInstance();

       try {
           const [cancelResults] = await Promise.all([
               instance.executeQuery<Notification[]>({
                   query: auditQuery,
                   parameters: {
                       BranchID: branches,
                   },
                   req
               }),
           ]);

           const formatResults = (results: any[]) => results.map(result => ({
               autoId: result.autoId,
               branchName: result.branchName,
               formName: result.formName,
               orderDateTime: result.orderDateTime,
               type: result.type
           }));

           const combinedResults = [
               ...formatResults(cancelResults),
           ].sort((a, b) => new Date(b.orderDateTime).getTime() - new Date(a.orderDateTime).getTime());

           return res.status(200).json(combinedResults);
       } catch (error) {
           console.warn('Database query failed, using mock data');
           return res.status(200).json(mockData.notifications);
       }
   } catch (error: any) {
       console.warn('Using mock data due to error:', error);
       return res.status(200).json(mockData.notifications);
   }
}