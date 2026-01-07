import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class LoginPage {
  
  credentials = {
    email: '',
    password: ''
  };

  loading = false;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  async login() {
    // 1. Validar que no estén vacíos
    if (!this.credentials.email || !this.credentials.password) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return;
    }

    this.loading = true;

    // 2. Llamar al servicio
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Login Exitoso:', response);
        
        // CORRECCIÓN 1: Guardamos el token
        localStorage.setItem('token', response.token); 
        
        // CORRECCIÓN 2: Guardamos el usuario (Estructura plana, sin .user)
        const userData = {
          id: response._id,
          username: response.username,
          email: response.email
        };
        localStorage.setItem('user', JSON.stringify(userData));

        // CORRECCIÓN 3: Mensaje de bienvenida con el nombre correcto
        this.showAlert('Éxito', 'Bienvenido ' + response.username);
        
        // AQUÍ ES DONDE FALTABA CERRAR LA SUSCRIPCIÓN Y EL IF
        this.showAlert('Éxito', 'Bienvenido ' + response.username);

        // DESCOMENTAR ESTO PARA NAVEGAR:
        this.navCtrl.navigateRoot('/home');
        
      },
      error: (err) => {
        this.loading = false;
        console.error('Error de login:', err);
        this.showAlert('Falló', 'Credenciales incorrectas o servidor apagado');
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