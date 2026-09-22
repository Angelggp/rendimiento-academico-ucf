-- CreateTable
CREATE TABLE "_AsignaturaToCarrera" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AsignaturaToCarrera_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AsignaturaToCarrera_B_index" ON "_AsignaturaToCarrera"("B");

-- AddForeignKey
ALTER TABLE "_AsignaturaToCarrera" ADD CONSTRAINT "_AsignaturaToCarrera_A_fkey" FOREIGN KEY ("A") REFERENCES "Asignatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AsignaturaToCarrera" ADD CONSTRAINT "_AsignaturaToCarrera_B_fkey" FOREIGN KEY ("B") REFERENCES "Carrera"("id") ON DELETE CASCADE ON UPDATE CASCADE;
