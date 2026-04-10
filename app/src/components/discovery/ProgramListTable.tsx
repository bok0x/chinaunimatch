import Link from "next/link";
import { formatCNY, computeYouNeedToPay, DEGREE_LABELS, LANGUAGE_LABELS } from "@/lib/utils";
import type { Program } from "@/types";

interface ProgramListTableProps {
  programs: Program[];
}

export function ProgramListTable({ programs }: ProgramListTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--glass-border-subtle)" }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--glass-border-subtle)" }}>
            <Th>City / Province</Th>
            <Th>Program Name</Th>
            <Th>Program ID</Th>
            <Th>Degree</Th>
            <Th>Language</Th>
            <Th>Intake</Th>
            <Th>You Need to Pay</Th>
            <Th>Apply</Th>
          </tr>
        </thead>
        <tbody>
          {programs.map((program, idx) => {
            const uni = program.university;
            const totalCost = computeYouNeedToPay(program);
            const intake = [program.intakeSeason, program.intakeYear].filter(Boolean).join(" ");

            return (
              <tr
                key={program.id}
                className="transition-colors"
                style={{
                  background: idx % 2 === 0 ? "var(--color-bg-primary)" : "var(--color-bg-secondary)",
                  borderBottom: "1px solid var(--glass-border-subtle)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-accent-muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "var(--color-bg-primary)" : "var(--color-bg-secondary)")}
              >
                <Td>
                  <div className="font-medium">{uni?.city ?? "—"}</div>
                  <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {uni?.province ?? ""}
                  </div>
                </Td>
                <Td>
                  <Link
                    href={`/programs/${program.id}`}
                    className="font-medium hover:underline line-clamp-2 max-w-[220px] block"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {program.programName}
                  </Link>
                  {uni && (
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      {uni.name}
                    </div>
                  )}
                </Td>
                <Td>
                  <span
                    className="font-mono text-xs px-2 py-1 rounded-lg"
                    style={{ background: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)" }}
                  >
                    {program.programCode || "—"}
                  </span>
                </Td>
                <Td>
                  <span className="badge badge-gray">{DEGREE_LABELS[program.degree] ?? program.degree}</span>
                </Td>
                <Td>
                  <span className="badge badge-gray">{LANGUAGE_LABELS[program.teachingLanguage] ?? program.teachingLanguage}</span>
                </Td>
                <Td>
                  {intake || "—"}
                </Td>
                <Td>
                  <div className="font-heading font-bold" style={{ color: "var(--color-accent)" }}>
                    {totalCost > 0 ? formatCNY(totalCost) : "—"}
                  </div>
                  {program.tuitionAfterScholarship != null && (
                    <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      after scholarship
                    </div>
                  )}
                </Td>
                <Td>
                  <Link
                    href={`/apply?program=${program.id}`}
                    className="btn-accent text-xs px-3 py-1.5 whitespace-nowrap"
                  >
                    Apply
                  </Link>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-heading font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap"
      style={{ color: "var(--color-text-tertiary)" }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-3 align-top" style={{ color: "var(--color-text-primary)" }}>
      {children}
    </td>
  );
}
