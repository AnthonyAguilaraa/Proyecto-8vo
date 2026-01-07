import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular'; 
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../services/catalog'; // Asegúrate que la ruta termine en .service
import { addIcons } from 'ionicons'; 
import { trashOutline, add, createOutline, cubeOutline, chevronBackOutline} from 'ionicons/icons';
import { CreateItemModalComponent } from '../../components/create-item-modal/create-item-modal.component';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ItemsPage implements OnInit {

  collectionName: string = '';
  collectionId: string = ''; 
  items: any[] = [];
  allItems: any[] = [];   // Copia de seguridad
  searchTerm: string = ''; 

  constructor(
    private route: ActivatedRoute,
    private catalogService: CatalogService,
    private alertController: AlertController, 
    private modalCtrl: ModalController 
  ) { 
    addIcons({ trashOutline, add, createOutline, cubeOutline, chevronBackOutline });
  }

  ngOnInit() {
    this.collectionName = this.route.snapshot.paramMap.get('name') || '';
    this.collectionId = this.route.snapshot.paramMap.get('id') || ''; 
    
    if (this.collectionName) {
      this.loadItems();
    }
  }

  loadItems() {
    this.catalogService.getItems(this.collectionName).subscribe({
      next: (data) => {
        this.allItems = data; // 1. Guardamos todo en la copia
        this.filterList();    // 2. Filtramos
      },
      error: (err) => console.error(err)
    });
  }

  // --- FUNCIÓN DEL BUSCADOR ---
  onSearchChange(event: any) {
    this.searchTerm = event.detail.value; 
    this.filterList();
  }

  filterList() {
    if (!this.searchTerm) {
      this.items = [...this.allItems]; 
      return;
    }

    const term = this.searchTerm.toLowerCase();

    this.items = this.allItems.filter(item => {
      const matchName = item.name && item.name.toLowerCase().includes(term);
      const matchDynamic = Object.values(item.dynamicData || {}).some((val: any) => 
        (val + '').toLowerCase().includes(term)
      );
      return matchName || matchDynamic;
    });
  }

  // --- FUNCIÓN FALTANTE: PULL TO REFRESH ---
  handleRefresh(event: any) {
    this.catalogService.getItems(this.collectionName).subscribe({
      next: (data) => {
        this.allItems = data;
        this.filterList(); // Volvemos a filtrar por si hay búsqueda
        event.target.complete(); // IMPORTANTE: Detiene la animación de carga
      },
      error: () => {
        event.target.complete(); // Detener animación aunque falle
      }
    });
  }

  // --- LÓGICA DEL MODAL ---
  async openCreateItemModal() {
    const modal = await this.modalCtrl.create({
      component: CreateItemModalComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.createItemFromModal(data.name, data.dynamicData);
    }
  }

  // Función para borrar con confirmación
  async deleteItem(item: any) {
    const alert = await this.alertController.create({
      header: '¿Borrar Item?',
      message: `¿Seguro que quieres eliminar "${item.name || 'este item'}"? No se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: () => {
            this.catalogService.deleteItem(item._id).subscribe({
              next: () => { this.loadItems(); },
              error: (err) => console.error('Error borrando:', err)
            });
          }
        }
      ]
    });
    await alert.present();
  }

  createItemFromModal(name: string, dynamicData: any) {
     const newItem = {
      name: name, 
      templateId: this.collectionId,
      dynamicData: dynamicData, 
      acquisition: {
        origin: "App Movil",
        date: new Date().toISOString(),
        price: 0,
        currency: "USD"
      }
    };

    this.catalogService.createItem(newItem).subscribe({
      next: (res) => { this.loadItems(); },
      error: (err) => console.error(err)
    });
  }

  // FUNCIÓN PARA EDITAR
  async editItem(item: any) {
    const modal = await this.modalCtrl.create({
      component: CreateItemModalComponent,
      componentProps: {
        itemToEdit: item 
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      const updatedItem = {
        name: data.name,
        templateId: this.collectionId,
        dynamicData: data.dynamicData,
        acquisition: item.acquisition 
      };

      this.catalogService.updateItem(item._id, updatedItem).subscribe({
        next: () => { this.loadItems(); },
        error: (err) => console.error('Error actualizando:', err)
      });
    }
  }
}