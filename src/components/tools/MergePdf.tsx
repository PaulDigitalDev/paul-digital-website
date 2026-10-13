import { useEffect, useRef, useState } from "react";
import { AR_LOCALE, arabicPlural, isolate } from "../../lib/arabic";
import { formatBytes, inspectPdf, mergePdfs } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILES = 30;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;

type Locale = "pt-BR" | "es" | "id" | "tr" | "fr" | "de" | "it" | "ru" | "ar";
/** Two forms (singular, plural), three Russian forms (1, 2–4, 5+) or six Arabic forms (zero, one, two, few, many, other; "{n}" is the count). */
type Forms = readonly [string, string] | readonly [string, string, string] | readonly [string, string, string, string, string, string];

/** Arabic text keeps Latin digits; file names are isolated so punctuation inside them cannot reorder the sentence. */
const NUMBER_LOCALE: Partial<Record<Locale, string>> = { ar: AR_LOCALE };
const iso = isolate;

interface Strings {
  outputName: string;
  cleared: string;
  reading: (name: string) => string;
  limitFiles: (name: string, max: number) => string;
  empty: (name: string) => string;
  tooBig: (name: string, size: string, max: string) => string;
  totalExceeded: (name: string, max: string) => string;
  encrypted: (name: string) => string;
  invalid: (name: string) => string;
  unreadable: (name: string) => string;
  added: Forms;
  moved: (name: string, pos: number, total: number) => string;
  fallbackName: string;
  removed: (name: string) => string;
  needTwo: string;
  mergingFile: (done: number, total: number) => string;
  finalizing: string;
  success: string;
  failure: string;
  selected: Forms;
  page: Forms;
  emptyTitle: string;
  emptySub: (max: string) => string;
  filledSub: (pages: string, size: string) => string;
  select: string;
  dropAria: string;
  privacy: string;
  listHeading: (n: number) => string;
  orderHint: string;
  listAria: string;
  up: (name: string) => string;
  down: (name: string) => string;
  removeAria: (name: string) => string;
  remove: string;
  merging: string;
  submit: string;
  needOneMore: string;
  listHint: string;
  result: string;
  format: string;
  size: string;
  pages: string;
  merged: string;
  download: string;
  reset: string;
}

const TEXT: Record<Locale, Strings> = {
  "pt-BR": {
    outputName: "juntar-pdf.pdf",
    cleared: "Lista de arquivos limpa. Selecione novos PDFs para começar.",
    reading: (name) => `Lendo ${name}…`,
    limitFiles: (name, max) => `${name}: não foi adicionado. O limite é de ${max} arquivos.`,
    empty: (name) => `${name}: o arquivo está vazio.`,
    tooBig: (name, size, max) => `${name}: tem ${size}, acima do limite de ${max} por arquivo.`,
    totalExceeded: (name, max) => `${name}: não foi adicionado porque o total passaria de ${max}.`,
    encrypted: (name) => `${name}: o PDF é protegido por senha. Remova a proteção e tente novamente.`,
    invalid: (name) => `${name}: este arquivo não é um PDF.`,
    unreadable: (name) => `${name}: não foi possível ler este PDF. Ele pode estar corrompido.`,
    added: ["PDF adicionado", "PDFs adicionados"],
    moved: (name, pos, total) => `${name} movido para a posição ${pos} de ${total}.`,
    fallbackName: "Arquivo",
    removed: (name) => `${name} removido.`,
    needTwo: "Adicione pelo menos dois PDFs para juntar.",
    mergingFile: (done, total) => `Juntando o arquivo ${done + 1} de ${total}…`,
    finalizing: "Finalizando o PDF…",
    success: "PDF criado com sucesso!",
    failure: "Não foi possível juntar os PDFs. Verifique os arquivos ou tente novamente com menos arquivos.",
    selected: ["PDF selecionado", "PDFs selecionados"],
    page: ["página", "páginas"],
    emptyTitle: "Arraste e solte seus arquivos PDF aqui",
    emptySub: (max) => `Selecione dois ou mais arquivos PDF para começar. Até ${max} cada.`,
    filledSub: (pages, size) => `${pages} · ${size} no total · adicione mais quando quiser`,
    select: "Selecionar arquivos PDF",
    dropAria: "Área para soltar arquivos PDF",
    privacy: "Seus arquivos são processados no seu dispositivo e não são enviados para um servidor.",
    listHeading: (n) => `Arquivos selecionados (${n})`,
    orderHint: "Organize os arquivos na ordem desejada.",
    listAria: "Arquivos selecionados, na ordem em que serão juntados",
    up: (name) => `Mover ${name} para cima`,
    down: (name) => `Mover ${name} para baixo`,
    removeAria: (name) => `Remover ${name}`,
    remove: "Remover",
    merging: "Juntando arquivos...",
    submit: "Juntar PDFs",
    needOneMore: "Adicione mais um PDF para poder juntá-los. ",
    listHint: "As páginas são unidas na ordem da lista. Use as setas para reorganizar e Remover para tirar um arquivo.",
    result: "Resultado",
    format: "Formato",
    size: "Tamanho",
    pages: "Páginas",
    merged: "Arquivos unidos",
    download: "Baixar PDF",
    reset: "Limpar arquivos",
  },
  es: {
    outputName: "unir-pdf.pdf",
    cleared: "Lista de archivos vaciada. Selecciona nuevos PDF para empezar.",
    reading: (name) => `Leyendo ${name}…`,
    limitFiles: (name, max) => `${name}: no se añadió. El límite es de ${max} archivos.`,
    empty: (name) => `${name}: el archivo está vacío.`,
    tooBig: (name, size, max) => `${name}: pesa ${size}, por encima del límite de ${max} por archivo.`,
    totalExceeded: (name, max) => `${name}: no se añadió porque el total superaría ${max}.`,
    encrypted: (name) => `${name}: el PDF está protegido con contraseña. Quita la protección e inténtalo de nuevo.`,
    invalid: (name) => `${name}: este archivo no es un PDF.`,
    unreadable: (name) => `${name}: no se pudo leer este PDF. Puede estar dañado.`,
    added: ["PDF añadido", "PDF añadidos"],
    moved: (name, pos, total) => `${name} movido a la posición ${pos} de ${total}.`,
    fallbackName: "Archivo",
    removed: (name) => `${name} eliminado.`,
    needTwo: "Añade al menos dos PDF para unirlos.",
    mergingFile: (done, total) => `Uniendo el archivo ${done + 1} de ${total}…`,
    finalizing: "Finalizando el PDF…",
    success: "¡PDF creado correctamente!",
    failure: "No se pudieron unir los PDF. Revisa los archivos o inténtalo de nuevo con menos archivos.",
    selected: ["PDF seleccionado", "PDF seleccionados"],
    page: ["página", "páginas"],
    emptyTitle: "Arrastra y suelta tus archivos PDF aquí",
    emptySub: (max) => `Selecciona dos o más archivos PDF para empezar. Hasta ${max} cada uno.`,
    filledSub: (pages, size) => `${pages} · ${size} en total · añade más cuando quieras`,
    select: "Seleccionar archivos PDF",
    dropAria: "Zona para soltar archivos PDF",
    privacy: "Tus archivos se procesan en tu dispositivo y no se envían a ningún servidor.",
    listHeading: (n) => `Archivos seleccionados (${n})`,
    orderHint: "Ordena los archivos como prefieras.",
    listAria: "Archivos seleccionados, en el orden en que se unirán",
    up: (name) => `Subir ${name}`,
    down: (name) => `Bajar ${name}`,
    removeAria: (name) => `Eliminar ${name}`,
    remove: "Eliminar",
    merging: "Uniendo archivos...",
    submit: "Unir PDF",
    needOneMore: "Añade un PDF más para poder unirlos. ",
    listHint: "Las páginas se unen en el orden de la lista. Usa las flechas para reordenar y Eliminar para quitar un archivo.",
    result: "Resultado",
    format: "Formato",
    size: "Tamaño",
    pages: "Páginas",
    merged: "Archivos unidos",
    download: "Descargar PDF",
    reset: "Vaciar archivos",
  },
  id: {
    outputName: "dokumen-gabungan.pdf",
    cleared: "Daftar berkas dikosongkan. Pilih PDF baru untuk memulai.",
    reading: (name) => `Membaca ${name}…`,
    limitFiles: (name, max) => `${name}: tidak ditambahkan. Batasnya ${max} berkas.`,
    empty: (name) => `${name}: berkas kosong.`,
    tooBig: (name, size, max) => `${name}: berukuran ${size}, melebihi batas ${max} per berkas.`,
    totalExceeded: (name, max) => `${name}: tidak ditambahkan karena total ukuran akan melebihi ${max}.`,
    encrypted: (name) => `${name}: PDF ini dilindungi kata sandi. Hapus perlindungannya lalu coba lagi.`,
    invalid: (name) => `${name}: berkas ini bukan PDF.`,
    unreadable: (name) => `${name}: PDF ini tidak dapat dibaca. Berkas mungkin rusak.`,
    added: ["PDF ditambahkan", "PDF ditambahkan"],
    moved: (name, pos, total) => `${name} dipindahkan ke posisi ${pos} dari ${total}.`,
    fallbackName: "Berkas",
    removed: (name) => `${name} dihapus.`,
    needTwo: "Tambahkan minimal dua PDF untuk digabungkan.",
    mergingFile: (done, total) => `Menggabungkan berkas ${done + 1} dari ${total}…`,
    finalizing: "Menyelesaikan PDF…",
    success: "PDF berhasil dibuat!",
    failure: "PDF tidak dapat digabungkan. Periksa berkas Anda atau coba lagi dengan jumlah berkas yang lebih sedikit.",
    selected: ["PDF dipilih", "PDF dipilih"],
    page: ["halaman", "halaman"],
    emptyTitle: "Tarik dan lepas berkas PDF Anda di sini",
    emptySub: (max) => `Pilih dua berkas PDF atau lebih untuk memulai. Hingga ${max} per berkas.`,
    filledSub: (pages, size) => `${pages} · total ${size} · tambahkan lagi kapan saja`,
    select: "Pilih File PDF",
    dropAria: "Area untuk melepas berkas PDF",
    privacy: "Berkas Anda diproses di perangkat Anda dan tidak dikirim ke server.",
    listHeading: (n) => `Berkas yang dipilih (${n})`,
    orderHint: "Atur berkas sesuai urutan yang diinginkan.",
    listAria: "Berkas yang dipilih, sesuai urutan penggabungan",
    up: (name) => `Naikkan ${name}`,
    down: (name) => `Turunkan ${name}`,
    removeAria: (name) => `Hapus ${name}`,
    remove: "Hapus",
    merging: "Sedang menggabungkan PDF...",
    submit: "Gabungkan PDF",
    needOneMore: "Tambahkan satu PDF lagi agar dapat digabungkan. ",
    listHint: "Halaman digabungkan sesuai urutan daftar. Gunakan tombol panah untuk mengatur ulang dan Hapus untuk mengeluarkan berkas.",
    result: "Hasil",
    format: "Format",
    size: "Ukuran",
    pages: "Halaman",
    merged: "Berkas digabungkan",
    download: "Unduh PDF Gabungan",
    reset: "Kosongkan berkas",
  },
  tr: {
    outputName: "pdf-birlestirilmis.pdf",
    cleared: "Dosya listesi temizlendi. Başlamak için yeni PDF dosyaları seçin.",
    reading: (name) => `${name} okunuyor…`,
    limitFiles: (name, max) => `${name}: eklenmedi. Sınır ${max} dosyadır.`,
    empty: (name) => `${name}: dosya boş.`,
    tooBig: (name, size, max) => `${name}: boyutu ${size}, dosya başına ${max} sınırını aşıyor.`,
    totalExceeded: (name, max) => `${name}: toplam boyut ${max} sınırını aşacağı için eklenmedi.`,
    encrypted: (name) => `${name}: bu PDF parola korumalı. Korumayı kaldırıp tekrar deneyin.`,
    invalid: (name) => `${name}: bu dosya bir PDF değil.`,
    unreadable: (name) => `${name}: bu PDF okunamadı. Dosya bozuk olabilir.`,
    added: ["PDF eklendi", "PDF eklendi"],
    moved: (name, pos, total) => `${name}, ${total} dosya arasında ${pos}. sıraya taşındı.`,
    fallbackName: "Dosya",
    removed: (name) => `${name} kaldırıldı.`,
    needTwo: "Birleştirmek için en az iki PDF ekleyin.",
    mergingFile: (done, total) => `${total} dosyadan ${done + 1}. birleştiriliyor…`,
    finalizing: "PDF tamamlanıyor…",
    success: "PDF başarıyla oluşturuldu!",
    failure: "PDF birleştirilemedi. Dosyalarınızı kontrol edin veya daha az dosyayla tekrar deneyin.",
    selected: ["PDF seçildi", "PDF seçildi"],
    page: ["sayfa", "sayfa"],
    emptyTitle: "PDF dosyalarınızı buraya sürükleyip bırakın",
    emptySub: (max) => `Başlamak için iki veya daha fazla PDF dosyası seçin. Dosya başına en fazla ${max}.`,
    filledSub: (pages, size) => `${pages} · toplam ${size} · istediğiniz zaman daha fazla ekleyin`,
    select: "PDF Dosyası Seç",
    dropAria: "PDF dosyalarını bırakma alanı",
    privacy: "Dosyalarınız cihazınızda işlenir ve bir sunucuya gönderilmez.",
    listHeading: (n) => `Seçilen dosyalar (${n})`,
    orderHint: "Dosyaları istediğiniz sıraya göre düzenleyin.",
    listAria: "Seçilen dosyalar, birleştirme sırasına göre",
    up: (name) => `${name} dosyasını yukarı taşı`,
    down: (name) => `${name} dosyasını aşağı taşı`,
    removeAria: (name) => `${name} dosyasını kaldır`,
    remove: "Kaldır",
    merging: "PDF'ler birleştiriliyor...",
    submit: "PDF'leri Birleştir",
    needOneMore: "Birleştirmek için bir PDF daha ekleyin. ",
    listHint: "Sayfalar listedeki sırayla birleştirilir. Sırayı değiştirmek için okları, bir dosyayı çıkarmak için Kaldır düğmesini kullanın.",
    result: "Sonuç",
    format: "Biçim",
    size: "Dosya boyutu",
    pages: "Sayfa",
    merged: "Birleştirilen dosya",
    download: "PDF'yi İndir",
    reset: "Dosyaları temizle",
  },
  fr: {
    outputName: "documents-fusionnes.pdf",
    cleared: "Liste vidée. Sélectionnez de nouveaux PDF pour recommencer.",
    reading: (name) => `Lecture de ${name}…`,
    limitFiles: (name, max) => `${name} : non ajouté. La limite est de ${max} fichiers.`,
    empty: (name) => `${name} : le fichier est vide.`,
    tooBig: (name, size, max) => `${name} : ${size}, ce qui dépasse la limite de ${max} par fichier.`,
    totalExceeded: (name, max) => `${name} : non ajouté, car la taille totale dépasserait ${max}.`,
    encrypted: (name) => `${name} : ce PDF est protégé par un mot de passe. Retirez la protection, puis réessayez.`,
    invalid: (name) => `${name} : ce fichier n'est pas un PDF.`,
    unreadable: (name) => `${name} : ce PDF est illisible. Le fichier est peut-être corrompu.`,
    added: ["PDF ajouté", "PDF ajoutés"],
    moved: (name, pos, total) => `${name} déplacé en position ${pos} sur ${total}.`,
    fallbackName: "Fichier",
    removed: (name) => `${name} supprimé.`,
    needTwo: "Ajoutez au moins deux PDF à fusionner.",
    mergingFile: (done, total) => `Fusion du fichier ${done + 1} sur ${total}…`,
    finalizing: "Finalisation du PDF…",
    success: "Le PDF a été créé !",
    failure: "Les PDF n'ont pas pu être fusionnés. Vérifiez vos fichiers ou réessayez avec moins de fichiers.",
    selected: ["PDF sélectionné", "PDF sélectionnés"],
    page: ["page", "pages"],
    emptyTitle: "Glissez-déposez vos fichiers PDF ici",
    emptySub: (max) => `Sélectionnez au moins deux PDF pour commencer. Jusqu'à ${max} par fichier.`,
    filledSub: (pages, size) => `${pages} · ${size} au total · vous pouvez en ajouter d'autres`,
    select: "Sélectionner des PDF",
    dropAria: "Zone de dépôt des fichiers PDF",
    privacy: "Vos fichiers sont traités sur votre appareil et ne sont envoyés à aucun serveur.",
    listHeading: (n) => `Fichiers sélectionnés (${n})`,
    orderHint: "Placez les fichiers dans l'ordre souhaité.",
    listAria: "Fichiers sélectionnés, dans l'ordre de fusion",
    up: (name) => `Monter ${name}`,
    down: (name) => `Descendre ${name}`,
    removeAria: (name) => `Supprimer ${name}`,
    remove: "Supprimer",
    merging: "Fusion des PDF en cours…",
    submit: "Fusionner les PDF",
    needOneMore: "Ajoutez un PDF de plus pour pouvoir fusionner. ",
    listHint: "Les pages sont fusionnées dans l'ordre de la liste. Utilisez les flèches pour réorganiser et Supprimer pour retirer un fichier.",
    result: "Résultat",
    format: "Format",
    size: "Taille",
    pages: "Pages",
    merged: "Fichiers fusionnés",
    download: "Télécharger le PDF fusionné",
    reset: "Vider la liste",
  },
  de: {
    outputName: "pdf-dateien-zusammengefuegt.pdf",
    cleared: "Liste geleert. Wählen Sie neue PDF-Dateien aus, um von vorn zu beginnen.",
    reading: (name) => `${name} wird gelesen …`,
    limitFiles: (name, max) => `${name}: nicht hinzugefügt. Das Limit liegt bei ${max} Dateien.`,
    empty: (name) => `${name}: Die Datei ist leer.`,
    tooBig: (name, size, max) => `${name}: ${size} – das überschreitet das Limit von ${max} pro Datei.`,
    totalExceeded: (name, max) => `${name}: nicht hinzugefügt, da die Gesamtgröße ${max} überschreiten würde.`,
    encrypted: (name) => `${name}: Dieses PDF ist passwortgeschützt. Entfernen Sie den Schutz und versuchen Sie es erneut.`,
    invalid: (name) => `${name}: Diese Datei ist kein PDF. Bitte wählen Sie eine gültige Datei aus.`,
    unreadable: (name) => `${name}: Dieses PDF kann nicht gelesen werden. Die Datei ist möglicherweise beschädigt.`,
    added: ["PDF-Datei hinzugefügt", "PDF-Dateien hinzugefügt"],
    moved: (name, pos, total) => `${name} an Position ${pos} von ${total} verschoben.`,
    fallbackName: "Datei",
    removed: (name) => `${name} entfernt.`,
    needTwo: "Fügen Sie mindestens zwei PDF-Dateien zum Zusammenfügen hinzu.",
    mergingFile: (done, total) => `Datei ${done + 1} von ${total} wird zusammengefügt …`,
    finalizing: "PDF wird fertiggestellt …",
    success: "Das PDF wurde erstellt!",
    failure: "Die PDF-Dateien konnten nicht zusammengefügt werden. Prüfen Sie Ihre Dateien oder versuchen Sie es mit weniger Dateien erneut.",
    selected: ["PDF-Datei ausgewählt", "PDF-Dateien ausgewählt"],
    page: ["Seite", "Seiten"],
    emptyTitle: "PDF-Dateien hierher ziehen und ablegen",
    emptySub: (max) => `Wählen Sie mindestens zwei PDF-Dateien aus. Bis zu ${max} pro Datei.`,
    filledSub: (pages, size) => `${pages} · insgesamt ${size} · Sie können weitere Dateien hinzufügen`,
    select: "Dateien hinzufügen",
    dropAria: "Ablagebereich für PDF-Dateien",
    privacy: "Ihre Dateien werden auf Ihrem Gerät verarbeitet und an keinen Server gesendet.",
    listHeading: (n) => `Ausgewählte Dateien (${n})`,
    orderHint: "Bringen Sie die Dateien in die gewünschte Reihenfolge.",
    listAria: "Ausgewählte Dateien in der Reihenfolge des Zusammenfügens",
    up: (name) => `${name} nach oben verschieben`,
    down: (name) => `${name} nach unten verschieben`,
    removeAria: (name) => `${name} entfernen`,
    remove: "Datei entfernen",
    merging: "PDF-Dateien werden zusammengefügt …",
    submit: "Dateien zusammenfügen",
    needOneMore: "Fügen Sie noch eine PDF-Datei hinzu, um zusammenzufügen. ",
    listHint: "Die Seiten werden in der Reihenfolge der Liste zusammengefügt. Mit den Pfeilen ändern Sie die Reihenfolge, mit „Datei entfernen“ löschen Sie eine Datei aus der Liste.",
    result: "Ergebnis",
    format: "Format",
    size: "Größe",
    pages: "Seiten",
    merged: "Zusammengefügte Dateien",
    download: "PDF herunterladen",
    reset: "Liste leeren",
  },
  it: {
    outputName: "pdf-uniti.pdf",
    cleared: "Elenco svuotato. Seleziona nuovi file PDF per ricominciare.",
    reading: (name) => `Lettura di ${name}…`,
    limitFiles: (name, max) => `${name}: non aggiunto. Il limite è di ${max} file.`,
    empty: (name) => `${name}: il file è vuoto.`,
    tooBig: (name, size, max) => `${name}: ${size} – supera il limite di ${max} per file.`,
    totalExceeded: (name, max) => `${name}: non aggiunto perché la dimensione totale supererebbe ${max}.`,
    encrypted: (name) => `${name}: questo PDF è protetto da password. Rimuovi la protezione e riprova.`,
    invalid: (name) => `${name}: questo file non è un PDF. Seleziona un file valido.`,
    unreadable: (name) => `${name}: impossibile leggere questo PDF. Il file potrebbe essere danneggiato.`,
    added: ["file PDF aggiunto", "file PDF aggiunti"],
    moved: (name, pos, total) => `${name} spostato in posizione ${pos} di ${total}.`,
    fallbackName: "File",
    removed: (name) => `${name} rimosso.`,
    needTwo: "Aggiungi almeno due file PDF da unire.",
    mergingFile: (done, total) => `Unione del file ${done + 1} di ${total}…`,
    finalizing: "Completamento del PDF…",
    success: "Il PDF è stato creato!",
    failure: "Impossibile unire i file PDF. Controlla i file oppure riprova con meno file.",
    selected: ["file PDF selezionato", "file PDF selezionati"],
    page: ["pagina", "pagine"],
    emptyTitle: "Trascina qui i file PDF",
    emptySub: (max) => `Seleziona almeno due file PDF. Fino a ${max} per file.`,
    filledSub: (pages, size) => `${pages} · ${size} in totale · Puoi aggiungere altri file`,
    select: "Aggiungi file",
    dropAria: "Area di rilascio per i file PDF",
    privacy: "I file vengono elaborati sul tuo dispositivo e non vengono inviati a nessun server.",
    listHeading: (n) => `File selezionati (${n})`,
    orderHint: "Metti i file nell'ordine desiderato.",
    listAria: "File selezionati nell'ordine di unione",
    up: (name) => `Sposta ${name} in alto`,
    down: (name) => `Sposta ${name} in basso`,
    removeAria: (name) => `Rimuovi ${name}`,
    remove: "Rimuovi",
    merging: "Unione dei PDF in corso…",
    submit: "Unisci i PDF",
    needOneMore: "Aggiungi un altro file PDF per poter unire. ",
    listHint: "Le pagine vengono unite nell'ordine dell'elenco. Usa le frecce per cambiare l'ordine e «Rimuovi» per eliminare un file dall'elenco.",
    result: "Risultato",
    format: "Formato",
    size: "Dimensione",
    pages: "Pagine",
    merged: "File uniti",
    download: "Scarica il PDF",
    reset: "Svuota l'elenco",
  },
  ru: {
    outputName: "obedinyonny-pdf.pdf",
    cleared: "Список очищен. Выберите новые PDF-файлы, чтобы начать заново.",
    reading: (name) => `Чтение файла ${name}…`,
    limitFiles: (name, max) => `${name}: не добавлен. Допустимо не более ${max} файлов.`,
    empty: (name) => `${name}: файл пустой.`,
    tooBig: (name, size, max) => `${name}: ${size} — превышает лимит ${max} на файл.`,
    totalExceeded: (name, max) => `${name}: не добавлен, так как общий размер превысил бы ${max}.`,
    encrypted: (name) => `${name}: этот PDF защищён паролем. Снимите защиту и повторите попытку.`,
    invalid: (name) => `${name}: это не PDF-файл. Выберите корректный файл.`,
    unreadable: (name) => `${name}: не удалось прочитать этот PDF. Возможно, файл повреждён.`,
    added: ["PDF-файл добавлен", "PDF-файла добавлено", "PDF-файлов добавлено"],
    moved: (name, pos, total) => `${name}: позиция ${pos} из ${total}.`,
    fallbackName: "Файл",
    removed: (name) => `${name} удалён из списка.`,
    needTwo: "Добавьте не менее двух PDF-файлов для объединения.",
    mergingFile: (done, total) => `Объединение файла ${done + 1} из ${total}…`,
    finalizing: "Завершение создания PDF…",
    success: "Объединённый PDF готов!",
    failure: "Не удалось объединить PDF-файлы. Проверьте файлы или попробуйте объединить меньше файлов.",
    selected: ["PDF-файл выбран", "PDF-файла выбрано", "PDF-файлов выбрано"],
    page: ["страница", "страницы", "страниц"],
    emptyTitle: "Перетащите сюда PDF-файлы",
    emptySub: (max) => `Выберите не менее двух PDF-файлов. До ${max} на файл.`,
    filledSub: (pages, size) => `${pages} · всего ${size} · можно добавить ещё файлы`,
    select: "Добавить файлы",
    dropAria: "Область для перетаскивания PDF-файлов",
    privacy: "Файлы обрабатываются на вашем устройстве и не отправляются на сервер.",
    listHeading: (n) => `Выбранные файлы (${n})`,
    orderHint: "Расположите файлы в нужном порядке.",
    listAria: "Выбранные файлы в порядке объединения",
    up: (name) => `Переместить ${name} выше`,
    down: (name) => `Переместить ${name} ниже`,
    removeAria: (name) => `Удалить ${name}`,
    remove: "Удалить файл",
    merging: "Объединение PDF-файлов…",
    submit: "Объединить PDF-файлы",
    needOneMore: "Добавьте ещё один PDF-файл, чтобы объединить. ",
    listHint: "Страницы объединяются в порядке списка. Стрелками меняйте порядок, а кнопкой «Удалить файл» убирайте файл из списка.",
    result: "Результат",
    format: "Формат",
    size: "Размер",
    pages: "Страницы",
    merged: "Объединено файлов",
    download: "Скачать PDF",
    reset: "Очистить список",
  },
  ar: {
    outputName: "damj-pdf.pdf",
    cleared: "تم مسح القائمة. اختر ملفات PDF جديدة للبدء من جديد.",
    reading: (name) => `جارٍ قراءة ${iso(name)}…`,
    limitFiles: (name, max) => `${iso(name)}: لم تتم إضافته. الحد الأقصى ${max} ملفًا.`,
    empty: (name) => `${iso(name)}: الملف فارغ.`,
    tooBig: (name, size, max) => `${iso(name)}: حجمه ${size} ويتجاوز الحد المسموح لكل ملف (${max}).`,
    totalExceeded: (name, max) => `${iso(name)}: لم تتم إضافته لأن الحجم الإجمالي سيتجاوز ${max}.`,
    encrypted: (name) => `${iso(name)}: ملف PDF هذا محمي بكلمة مرور. أزل الحماية ثم حاول مرة أخرى.`,
    invalid: (name) => `${iso(name)}: هذا ليس ملف PDF صالحًا. اختر ملفًا صحيحًا.`,
    unreadable: (name) => `${iso(name)}: تعذّرت قراءة ملف PDF هذا. ربما يكون الملف تالفًا.`,
    added: ["لم تتم إضافة ملفات", "تمت إضافة ملف PDF واحد", "تمت إضافة ملفَّي PDF", "تمت إضافة {n} ملفات PDF", "تمت إضافة {n} ملف PDF", "تمت إضافة {n} ملف PDF"],
    moved: (name, pos, total) => `${iso(name)}: الموضع ${pos} من ${total}.`,
    fallbackName: "الملف",
    removed: (name) => `تمت إزالة ${iso(name)} من القائمة.`,
    needTwo: "أضف ملفَّي PDF على الأقل لدمجهما.",
    mergingFile: (done, total) => `جارٍ دمج الملف ${done + 1} من ${total}…`,
    finalizing: "جارٍ إنهاء ملف PDF…",
    success: "ملف PDF المدموج جاهز!",
    failure: "تعذّر دمج ملفات PDF. تحقق من الملفات أو حاول دمج عدد أقل منها.",
    selected: ["لم يتم اختيار ملفات", "تم اختيار ملف PDF واحد", "تم اختيار ملفَّي PDF", "تم اختيار {n} ملفات PDF", "تم اختيار {n} ملف PDF", "تم اختيار {n} ملف PDF"],
    page: ["بلا صفحات", "صفحة واحدة", "صفحتان", "{n} صفحات", "{n} صفحة", "{n} صفحة"],
    emptyTitle: "اسحب ملفات PDF وأفلتها هنا",
    emptySub: (max) => `اختر ملفَّي PDF على الأقل. الحد الأقصى ${max} لكل ملف.`,
    filledSub: (pages, size) => `${pages} · الإجمالي ${size} · يمكنك إضافة المزيد من الملفات`,
    select: "إضافة ملفات",
    dropAria: "منطقة سحب وإفلات ملفات PDF",
    privacy: "تتم معالجة الملفات على جهازك ولا يتم إرسالها إلى أي خادم.",
    listHeading: (n) => `الملفات المختارة (${n})`,
    orderHint: "رتّب الملفات بالترتيب الذي تريده.",
    listAria: "الملفات المختارة بترتيب الدمج",
    up: (name) => `نقل ${iso(name)} إلى أعلى`,
    down: (name) => `نقل ${iso(name)} إلى أسفل`,
    removeAria: (name) => `إزالة ${iso(name)}`,
    remove: "إزالة الملف",
    merging: "جارٍ دمج ملفات PDF…",
    submit: "دمج ملفات PDF",
    needOneMore: "أضف ملف PDF آخر لتتمكن من الدمج. ",
    listHint: "يتم دمج الصفحات بحسب ترتيب القائمة. استخدم الأسهم لتغيير الترتيب وزر «إزالة الملف» لحذف ملف من القائمة.",
    result: "النتيجة",
    format: "الصيغة",
    size: "الحجم",
    pages: "الصفحات",
    merged: "الملفات المدموجة",
    download: "تنزيل ملف PDF",
    reset: "مسح القائمة",
  },
};

interface Item {
  id: number;
  file: File;
  pages: number;
}

interface Result {
  url: string;
  size: number;
  pages: number;
  files: number;
}

const plural = (n: number, forms: Forms) => {
  if (forms.length === 6) {
    return arabicPlural(n, forms);
  }
  if (forms.length === 3) {
    const last = n % 10;
    const teen = n % 100 >= 11 && n % 100 <= 14;
    return `${n} ${last === 1 && !teen ? forms[0] : last >= 2 && last <= 4 && !teen ? forms[1] : forms[2]}`;
  }
  return `${n} ${n === 1 ? forms[0] : forms[1]}`;
};

export default function MergePdf({ locale = "pt-BR" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const fmt = (bytes: number) => formatBytes(bytes, NUMBER_LOCALE[locale] ?? locale);
  const OUTPUT_NAME = t.outputName;
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const idRef = useRef(0);
  const urlRef = useRef<string | null>(null);
  const runningRef = useRef(false);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const clearResult = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setResult(null);
  };

  const reset = () => {
    clearResult();
    setItems([]);
    setErrors([]);
    setStatus(t.cleared);
  };

  const addFiles = async (incoming: File[]) => {
    if (busy || incoming.length === 0) return;
    clearResult();
    setStatus("");
    setBusy(true);
    const problems: string[] = [];
    const accepted: Item[] = [];
    let total = items.reduce((sum, item) => sum + item.file.size, 0);
    try {
      for (const file of incoming) {
        setProgress(t.reading(file.name));
        if (items.length + accepted.length >= MAX_FILES) {
          problems.push(t.limitFiles(file.name, MAX_FILES));
          continue;
        }
        if (file.size === 0) {
          problems.push(t.empty(file.name));
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          problems.push(t.tooBig(file.name, fmt(file.size), fmt(MAX_FILE_BYTES)));
          continue;
        }
        if (total + file.size > MAX_TOTAL_BYTES) {
          problems.push(t.totalExceeded(file.name, fmt(MAX_TOTAL_BYTES)));
          continue;
        }
        const info = await inspectPdf(new Uint8Array(await file.arrayBuffer()));
        if (!info.ok) {
          problems.push(
            info.reason === "encrypted"
              ? t.encrypted(file.name)
              : info.reason === "invalid"
                ? t.invalid(file.name)
                : t.unreadable(file.name),
          );
          continue;
        }
        total += file.size;
        accepted.push({ id: ++idRef.current, file, pages: info.pages });
      }
    } finally {
      setBusy(false);
      setProgress("");
    }
    setErrors(problems);
    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      setStatus(`${plural(accepted.length, t.added)}.`);
    }
  };

  const move = (index: number, delta: number) => {
    if (busy) return;
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    clearResult();
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    setItems(next);
    setStatus(t.moved(items[index].file.name, to + 1, items.length));
  };

  const remove = (id: number) => {
    if (busy) return;
    clearResult();
    const name = items.find((item) => item.id === id)?.file.name ?? t.fallbackName;
    setItems((current) => current.filter((item) => item.id !== id));
    setStatus(t.removed(name));
  };

  const run = async () => {
    if (runningRef.current) return;
    if (items.length < 2) return setErrors([t.needTwo]);
    runningRef.current = true;
    setErrors([]);
    clearResult();
    setBusy(true);
    setStatus("");
    try {
      const sources: Uint8Array[] = [];
      for (const item of items) sources.push(new Uint8Array(await item.file.arrayBuffer()));
      const merged = await mergePdfs(sources, (done, total) => setProgress(t.mergingFile(done, total)));
      setProgress(t.finalizing);
      const blob = new Blob([merged.bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setResult({ url, size: blob.size, pages: merged.pages, files: items.length });
      setStatus(t.success);
    } catch {
      setErrors([t.failure]);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);
  const totalPages = items.reduce((sum, item) => sum + item.pages, 0);

  return (
    <div className="ic" lang={locale} dir={locale === "ar" ? "rtl" : undefined}>
      <DropArea
        title={plural(items.length, t.selected)}
        hasFiles={items.length > 0}
        emptyTitle={t.emptyTitle}
        emptySub={t.emptySub(fmt(MAX_FILE_BYTES))}
        filledSub={t.filledSub(plural(totalPages, t.page), fmt(totalSize))}
        buttonLabel={t.select}
        moreLabel={t.select}
        accept="application/pdf,.pdf"
        multiple
        busy={busy}
        ariaLabel={t.dropAria}
        onFiles={(files) => void addFiles(files)}
      />
      <p className="ic-hint">{t.privacy}</p>

      {items.length > 0 && <h2 className="jp-heading">{t.listHeading(items.length)}</h2>}
      {items.length > 0 && <p className="ic-hint">{t.orderHint}</p>}
      {items.length > 0 && (
        <ol className="jp-list" aria-label={t.listAria}>
          {items.map((item, index) => (
            <li key={item.id} className="jp-item">
              <span className="jp-num" aria-hidden="true">
                {index + 1}
              </span>
              <span className="jp-name">
                <bdi>{item.file.name}</bdi>
                <small>
                  {plural(item.pages, t.page)} · {fmt(item.file.size)}
                </small>
              </span>
              <span className="jp-actions">
                <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={t.up(item.file.name)}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={busy || index === items.length - 1}
                  aria-label={t.down(item.file.name)}
                >
                  ↓
                </button>
                <button type="button" onClick={() => remove(item.id)} disabled={busy} aria-label={t.removeAria(item.file.name)}>
                  {t.remove}
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <button type="submit" className="button button-primary ic-submit" disabled={items.length < 2 || busy}>
          {busy ? t.merging : t.submit}
        </button>
      </form>
      <p className="ic-hint">
        {items.length === 1 ? t.needOneMore : ""}
        {t.listHint}
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? t.merging : status}
      </div>
      {busy && progress ? (
        <p className="ic-hint ic-progress" aria-hidden="true">
          {progress}
        </p>
      ) : null}
      {errors.length > 0 && (
        <div className="ic-error" role="alert">
          {errors.map((message, index) => (
            <p key={index} style={{ margin: 0 }}>
              {message}
            </p>
          ))}
        </div>
      )}

      {result && (
        <ResultPanel
          ariaLabel={t.result}
          tone="success"
          title={t.success}
          fileName={OUTPUT_NAME}
          details={[
            { label: t.format, value: "PDF" },
            { label: t.size, value: fmt(result.size) },
            { label: t.pages, value: String(result.pages) },
            { label: t.merged, value: String(result.files) },
          ]}
          primary={
            <a className="button button-download" href={result.url} download={OUTPUT_NAME}>
              {t.download}
            </a>
          }
          resetLabel={t.reset}
          onReset={reset}
        />
      )}
    </div>
  );
}
