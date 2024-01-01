import JsBarcode from 'jsbarcode'

const handlePrintBarcode = (itemId) => {
    // Create a new window
    const printWindow = window.open('', '_blank');

    // Create a canvas element
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, 'ITM-' + itemId.toString(), { format: 'CODE128' });
    const barcodeDataUrl = canvas.toDataURL('image/png');

    // Generate the HTML content for the new window
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Barcode</title>
                <style>
                @media print {
                    /* Hide everything in the body when printing... */
                    body * {
                        visibility: hidden;
                    }
                    /* ...except the barcode image */
                    img {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                    /* Remove default margins set by the browser */
                    @page {
                        margin: 0;
                        size: auto;
                    }
                }
            </style>
            </head>
            <body>
                <img src="${barcodeDataUrl}" />
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
        </html>
    `);

    // Close the document to finish writing to the new window
    printWindow.document.close();
};

export default handlePrintBarcode