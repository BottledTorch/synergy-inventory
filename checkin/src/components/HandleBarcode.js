import JsBarcode from 'jsbarcode';

const handlePrintBarcode = (itemId) => {
    // Create a new window
    const printWindow = window.open('', '_blank');

    // Generate the barcode data URL
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, 'ITM-' + itemId.toString(), {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true,
        textMargin: 2,
        fontSize: 14
    });
    const barcodeDataUrl = canvas.toDataURL('image/png');

    // Generate the HTML content for the new window
    const htmlContent = `
        <html>
            <head>
                <title>Print Barcode</title>
                <style>
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        text-align: center;
                    }
                    .barcode-container {
                        width: 3.5in;
                        height: 1.125in;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        page-break-after: always;
                    }
                    .barcode-image {
                        max-width: 100%;
                        max-height: 100%;
                    }
                    @page {
                        margin: 0;
                        size: 3.5in 1.125in;
                    }
                }
                </style>
            </head>
            <body>
                <div class="barcode-container">
                    <img class="barcode-image" src="${barcodeDataUrl}" />
                </div>
            </body>
        </html>
    `;

    // Write the HTML content to the new window and print it when loaded
    printWindow.document.write(htmlContent);
    printWindow.document.close(); // Close the document to finish writing
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
};

export default handlePrintBarcode;
