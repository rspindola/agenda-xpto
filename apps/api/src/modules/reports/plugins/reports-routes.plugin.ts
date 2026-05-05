import type { FastifyPluginCallback, FastifyRequest, FastifyReply } from "fastify";
import type { ReportsService } from "~/modules/reports/reports.service.js";
import {
  reportParamsSchema,
  reportQuerySchema,
  reportResponseSchema,
  reportRequiresUpgradeResponseSchema,
  errorResponseSchema,
} from "~/modules/reports/reports.schema.js";
import { formatReportCsv } from "~/lib/csv-formatter.js";
import { generateReportPdf } from "~/lib/pdf-generator.js";

export function createReportsRoutesPlugin(service: ReportsService): FastifyPluginCallback {
  return (fastify, _opts, done) => {
    // GET JSON report
    fastify.get(
      "/:reportType",
      {
        schema: {
          tags: ["reports"],
          summary: "Get report as JSON",
          description:
            "Retrieve a detailed appointment or business analytics report. Some reports require a Pro or Business plan.",
          params: reportParamsSchema,
          querystring: reportQuerySchema,
          response: {
            200: reportResponseSchema,
            400: errorResponseSchema,
            401: errorResponseSchema,
            403: reportRequiresUpgradeResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.authUser;
        if (!user) {
          return reply.status(401).send({
            statusCode: 401,
            code: "UNAUTHORIZED",
            message: "Session required.",
          });
        }

        const params = reportParamsSchema.parse(request.params);
        const query = reportQuerySchema.parse(request.query);

        const report = await service.getReport(user.id, params.establishmentId, params.reportType, query);

        return reply.status(200).send(report);
      },
    );

    // GET CSV report
    fastify.get(
      "/:reportType/csv",
      {
        schema: {
          tags: ["reports"],
          summary: "Get report as CSV",
          description: "Export report data as CSV format (text/csv).",
          params: reportParamsSchema,
          querystring: reportQuerySchema,
          response: {
            400: errorResponseSchema,
            401: errorResponseSchema,
            403: reportRequiresUpgradeResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.authUser;
        if (!user) {
          return reply.status(401).send({
            statusCode: 401,
            code: "UNAUTHORIZED",
            message: "Session required.",
          });
        }

        const params = reportParamsSchema.parse(request.params);
        const query = reportQuerySchema.parse(request.query);

        const report = await service.getReport(user.id, params.establishmentId, params.reportType, query);

        const csv = formatReportCsv(report);
        return reply
          .type("text/csv")
          .header("Content-Disposition", `attachment; filename="report-${report.reportType}-${Date.now().toString()}.csv"`)
          .send(csv);
      },
    );

    // GET PDF report
    fastify.get(
      "/:reportType/pdf",
      {
        schema: {
          tags: ["reports"],
          summary: "Get report as PDF",
          description: "Export report data as PDF document (application/pdf).",
          params: reportParamsSchema,
          querystring: reportQuerySchema,
          response: {
            400: errorResponseSchema,
            401: errorResponseSchema,
            403: reportRequiresUpgradeResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.authUser;
        if (!user) {
          return reply.status(401).send({
            statusCode: 401,
            code: "UNAUTHORIZED",
            message: "Session required.",
          });
        }

        const params = reportParamsSchema.parse(request.params);
        const query = reportQuerySchema.parse(request.query);

        const report = await service.getReport(user.id, params.establishmentId, params.reportType, query);

        const pdfBuffer = await generateReportPdf(report);
        return reply
          .type("application/pdf")
          .header("Content-Disposition", `attachment; filename="report-${report.reportType}-${Date.now().toString()}.pdf"`)
          .send(pdfBuffer);
      },
    );
    done();
  };
}
