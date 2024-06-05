import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'gpa-dropzone',
    templateUrl: './dropzone.component.html',
    styleUrl: './dropzone.component.css',
})
export class DropzoneComponent {
    files: any[] = [];
    @Output() fileUploaded = new EventEmitter<any>();

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            const files = event.dataTransfer.files;
            this.handleFiles(files);
        }
    }

    onFileSelected(event: any) {
        const files = event.target.files;
        this.handleFiles(files);
    }

    handleFiles(uploadedFiles: FileList) {
        Array.from(uploadedFiles).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const newFile = {
                    dataURL: e.target.result,
                    name: file.name,
                    isImage: file.type.startsWith('image/'),
                    progress: 0,
                    total: file.size,
                    bytesSent: 0,
                    uploadComplete: false,
                };

                console.log('File uploaded:', newFile);

                this.simulateUpload(newFile);
                this.files.push(newFile);
                this.fileUploaded.emit(newFile); // Emit the uploaded file
            };
            reader.readAsDataURL(file);
        });
    }

    simulateUpload(file: any) {
        const minSteps = 6;
        const maxSteps = 60;
        const timeBetweenSteps = 500;
        const bytesPerStep = 100000;

        const totalSteps = Math.round(
            Math.min(maxSteps, Math.max(minSteps, file.total / bytesPerStep))
        );

        for (let step = 0; step < totalSteps; step++) {
            setTimeout(() => {
                const progress = Math.round((100 * (step + 1)) / totalSteps); // redondear a entero
                const bytesSent = Math.round(
                    ((step + 1) * file.total) / totalSteps
                ); // redondear a entero

                file.progress = progress;
                file.bytesSent = bytesSent;

                // Dispara el evento de actualizacion del archivo
                this.updateFile(file);

                if (file.progress === 100) {
                    file.status = 'SUCCESS';
                    file.uploadComplete = true;
                }
            }, timeBetweenSteps * (step + 1));
        }
    }

    /**
     * Actuliza el archivo en la lista de archivos.
     *
     * @param file -  Archivo a actualizar
     */
    updateFile(file: any) {
        this.files = [...this.files];
    }

    removeFile(index: number) {
        this.files.splice(index, 1);
        this.updateFile({});
    }

    convertSize(bytes: number): string {
        if (bytes < 1000) {
            return `${(bytes / 1024).toFixed(2)} KB`; // convierte bytes a KB
        } else {
            return `${(bytes / 1024 / 1024).toFixed(2)} MB`; // convierte bytes a MB
        }
    }
}
