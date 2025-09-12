import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Render işlemleri için tüm CPU çekdeklerini kullan
Config.setConcurrency(null);

// Güvenlik ayarları
Config.setChromiumDisableWebSecurity(false);
Config.setChromiumIgnoreCertificateErrors(false);

// Statik dosyaların yolu
Config.setPublicDir('./public');
