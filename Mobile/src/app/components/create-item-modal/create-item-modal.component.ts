import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UploadService } from '../../services/upload';
import { Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-item-modal',
  templateUrl: './create-item-modal.component.html',
  styleUrls: ['./create-item-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreateItemModalComponent {

  @Input() itemToEdit: any;

  // Datos fijos
  name: string = '';
  
  // Datos dinámicos (Array de objetos clave/valor)
  customFields: { key: string; value: string }[] = [];
  
  // Imagen
  capturedImage: any = null; // Para mostrar en pantalla
  imageBlob: Blob | null = null; // Para enviar al servidor
  isUploading = false;
  // Guardamos la URL vieja por si no suben foto nueva
  existingImageUrl: string = '';

  constructor(
    private modalCtrl: ModalController,
    private uploadService: UploadService
  ) {}

  // 1. Agregar un nuevo renglón para escribir datos
  addField() {
    this.customFields.push({ key: '', value: '' });
  }

  // 2. Eliminar un renglón
  removeField(index: number) {
    this.customFields.splice(index, 1);
  }

  // 3. Tomar Foto
  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 30,
      allowEditing: false,
      resultType: CameraResultType.Uri, // Obtenemos la ruta temporal
      source: CameraSource.Prompt // Pregunta: ¿Cámara o Galería?
    });

    this.capturedImage = image.webPath;
    
    // Convertir a Blob para poder subirlo
    if (image.webPath) {
        const response = await fetch(image.webPath);
        this.imageBlob = await response.blob();
    }
  }

  ngOnInit() {
    // Si nos pasaron un item, rellenamos los campos (Modo Edición)
    if (this.itemToEdit) {
      this.name = this.itemToEdit.name; // O itemToEdit.dynamicData['Nombre']

      // Recuperar campos dinámicos y la imagen
      const data = this.itemToEdit.dynamicData || {};
      
      Object.keys(data).forEach(key => {
        // Ignoramos 'Nombre' porque ya lo tenemos en el campo principal
        if (key === 'Nombre') return;

        // Si encontramos la imagen, la mostramos
        if (data[key].toString().startsWith('http')) {
            this.capturedImage = data[key];
            this.existingImageUrl = data[key];
        } else {
            // Cualquier otro dato va a la lista de campos
            this.customFields.push({ key: key, value: data[key] });
        }
      });
    }
  }

  // 4. Guardar Todo
async save() {
    if (!this.name) return;
    this.isUploading = true;
    let finalImageUrl = this.existingImageUrl; // Por defecto usamos la vieja

    try {
      // Solo subimos imagen si el usuario tomó una NUEVA (tenemos un Blob)
      if (this.imageBlob) {
        const uploadRes: any = await this.uploadService.uploadImage(this.imageBlob).toPromise();
        finalImageUrl = uploadRes.imageUrl;
      }

      // Reconstruimos el objeto
      const dynamicData: any = { "Nombre": this.name };

      // Ponemos la imagen (nueva o vieja)
      if (finalImageUrl) {
        dynamicData['Imagen'] = finalImageUrl;
      }

      // Ponemos los campos extra
      this.customFields.forEach(field => {
        if (field.key && field.value) {
          dynamicData[field.key] = field.value;
        }
      });

      this.modalCtrl.dismiss({
        name: this.name,
        dynamicData: dynamicData
      });

    } catch (error) {
      console.error("Error", error);
      this.isUploading = false;
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}