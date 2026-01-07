import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';
import { CatalogService } from '../../services/catalog';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth';
import { addIcons } from 'ionicons'; // Importante para registrar
import { logOutOutline, add, folderOpenOutline, chevronForwardOutline, fileTrayOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class HomePage {
  
  collections: any[] = []; // Aquí guardaremos las carpetas que traiga el servidor
  username: string = '';

  constructor(
    private catalogService: CatalogService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService, // <--- INYECTAR AUTH SERVICE
    private navCtrl: NavController
    
  ) {
    addIcons({ logOutOutline, add, 
      folderOpenOutline,      // <--- Icono de carpeta
      chevronForwardOutline,  // <--- Flechita derecha
      fileTrayOutline });
  }

  // Se ejecuta cada vez que la vista va a entrar
  ionViewWillEnter() {
    this.loadUserData();
    this.loadCollections();
  }

  loadUserData() {
    // Recuperamos el nombre guardado en el Login para saludar
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.username = JSON.parse(userStr).username;
    }
  }

  // 3. AGREGAR ESTA FUNCIÓN AL FINAL
  logout() {
    this.authService.logout(); // Borra el token
    this.navCtrl.navigateRoot('/login'); // Nos manda al login y borra el historial de navegación
  }

 loadCollections() {
    this.catalogService.getCollections().subscribe({
      next: (data) => {
        this.collections = data;

        // --- NUEVO: Calcular el conteo manualmente ---
        // Recorremos cada colección y preguntamos cuántos items tiene
        this.collections.forEach((col: any) => {
          
          // Por defecto ponemos 0 mientras carga
          col.itemCount = 0; 

          // Llamamos al servicio para contar
          this.catalogService.getItems(col.name).subscribe({
            next: (items) => {
              // ¡Aquí actualizamos el número real!
              col.itemCount = items.length;
            },
            error: () => { 
              col.itemCount = 0; 
            }
          });

        });
        // ---------------------------------------------
      },
      error: (err) => console.error('Error cargando colecciones:', err)
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }


// 1. Abrir la alerta para pedir el nombre
  async openCreateAlert() {
    const alert = await this.alertController.create({
      header: 'Nueva Colección',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Ej: Zapatillas, Tazos...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: (data) => {
            // Si escribió algo, lo mandamos a guardar
            if (data.name) {
              this.createCollection(data.name);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // 2. Llamar al servicio para guardar en Docker
  createCollection(name: string) {
    // El backend espera un objeto con "name" y "fields" (por ahora fields vacío)
    const newCollection = {
      name: name,
      fields: [] // Lo mandamos vacío por simplicidad
    };

    this.catalogService.createCollection(newCollection).subscribe({
      next: (response) => {
        console.log('Creado!', response);
        // Recargamos la lista para que aparezca la nueva carpeta
        this.loadCollections(); 
      },
      error: (err) => {
        console.error(err);
        this.showAlert('Error', 'No se pudo crear la colección');
      }
    });
  }

}