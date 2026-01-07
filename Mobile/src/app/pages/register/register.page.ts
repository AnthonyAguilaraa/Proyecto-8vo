import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, NavController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage {

  // Objeto para guardar los datos del formulario
  user = {
    username: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private navCtrl: NavController,
    private loadingController: LoadingController
  ) {}

  async register() {
    // 1. Validar campos vacíos
    if (!this.user.username || !this.user.email || !this.user.password) {
      this.showAlert('Faltan datos', 'Por favor completa todos los campos.');
      return;
    }

    // 2. Mostrar cargando...
    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    // 3. Enviar al Backend
    this.authService.register(this.user).subscribe({
      next: async (res) => {
        loading.dismiss();
        console.log('Registro exitoso:', res);
        
        // Mensaje de éxito
        await this.showAlert('¡Éxito!', 'Tu cuenta ha sido creada. Ahora inicia sesión.');
        
        // Volver al Login automáticamente
        this.navCtrl.navigateBack('/login');
      },
      error: (err) => {
        loading.dismiss();
        console.error('Error registro:', err);
        // Mensaje de error (ej: El correo ya existe)
        this.showAlert('Error', err.error.message || 'No se pudo crear la cuenta.');
      }
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
}