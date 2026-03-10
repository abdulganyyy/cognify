import { FilePlus2 } from "lucide-react"

import { DocumentList } from "@/components/documents/DocumentList"
import { PageHeader } from "@/components/shared/PageHeader"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { UploadTriggerButton } from "@/components/shared/UploadTriggerButton"
import type { DocumentCardProps } from "@/components/documents/DocumentCard"

const documents: DocumentCardProps[] = [
  {
    id: "doc-1",
    title: "Pengantar Machine Learning",
    description:
      "Ringkasan dasar supervised learning, unsupervised learning, dan evaluasi model.",
    status: "ready",
    updatedAt: "2 jam lalu",
    pageCount: 42,
    bookmarked: true,
    topics: [
      { id: "t-1", label: "Supervised Learning" },
      { id: "t-2", label: "Model Evaluation" },
      { id: "t-3", label: "Classification" },
    ],
  },
  {
    id: "doc-2",
    title: "Linear Algebra for AI",
    description:
      "Konsep vektor, matriks, eigenvalues, dan aplikasinya untuk machine learning.",
    status: "processing",
    updatedAt: "Hari ini",
    pageCount: 67,
    topics: [
      { id: "t-4", label: "Vectors" },
      { id: "t-5", label: "Matrices" },
    ],
  },
  {
    id: "doc-3",
    title: "Statistika Dasar",
    description:
      "Materi probabilitas, distribusi, mean, variance, dan pengantar inferensi statistik.",
    status: "uploaded",
    updatedAt: "Kemarin",
    pageCount: 29,
    topics: [{ id: "t-6", label: "Probability" }],
  },
  {
    id: "doc-4",
    title: "Deep Learning Notes",
    description:
      "Catatan neural network, activation functions, backpropagation, dan optimizers.",
    status: "failed",
    updatedAt: "3 hari lalu",
    pageCount: 51,
    topics: [
      { id: "t-7", label: "Neural Networks" },
      { id: "t-8", label: "Backpropagation" },
      { id: "t-9", label: "Optimizers" },
      { id: "t-10", label: "Activation Functions" },
    ],
  },
]

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Documents"
        title="Dokumen Belajar"
        description="Kelola materi, pantau status proses, dan buka kembali topik penting dari setiap dokumen."
      />

      <section className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm sm:p-5">
        <UploadTriggerButton
          label="Unggah dokumen baru"
          helperText="PDF, DOCX, atau file materi lainnya untuk diproses di Cognify"
        />
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Semua Dokumen"
          description="Kumpulan dokumen yang sudah diunggah dan diproses."
        />

        <DocumentList documents={documents} />
      </section>
    </div>
  )
}