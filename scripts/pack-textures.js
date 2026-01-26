const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../src/assets/images-source');
const OUTPUT_DIR = path.join(__dirname, '../src/assets/atlases');
const MANIFEST_PATH = path.join(__dirname, '../src/assets/atlases/manifest.json');
const MAX_FILES_PER_ATLAS = 50; // Max files per atlas to avoid command line length issues on Windows
const TEXTUREPACKER_SETTINGS = {
    format: 'phaser',
    algorithm: 'MaxRects',
    padding: 2,
    extrude: 1,
    maxWidth: 2048,
    maxHeight: 2048,
    trimMode: 'Trim',
    scale: 1,
    premultiplyAlpha: false,
    allowRotation: false,
    allowFreeSize: true
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkTexturePackerCLI() {
    try {
        execSync('TexturePacker --version', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

function checkLicenseKey() {
    const licenseKey = process.env.TEXTUREPACKER_LICENSE;

    if (!licenseKey) {
        log('\n⚠️  WARNING: TEXTUREPACKER_LICENSE environment variable not set!', 'yellow');
        log('TexturePacker will run in trial mode with watermarks.\n', 'yellow');
        log('To set your license key:', 'cyan');
        log('  Windows (PowerShell): $env:TEXTUREPACKER_LICENSE="your-license-key"', 'cyan');
        log('  Windows (CMD):        set TEXTUREPACKER_LICENSE=your-license-key', 'cyan');
        log('  Linux/Mac:           export TEXTUREPACKER_LICENSE="your-license-key"\n', 'cyan');
        log('Or create a .env file in the project root with:', 'cyan');
        log('  TEXTUREPACKER_LICENSE=your-license-key\n', 'cyan');
        return null;
    }

    return licenseKey;
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`✓ Created directory: ${dirPath}`, 'green');
    }
}

function getSubfolders(dirPath) {
    if (!fs.existsSync(dirPath)) {
        log(`✗ Source directory not found: ${dirPath}`, 'red');
        log('Creating example directory structure...', 'yellow');

        // Create example folders
        const exampleFolders = ['characters', 'enemies', 'ui', 'environment'];
        exampleFolders.forEach(folder => {
            ensureDirectoryExists(path.join(dirPath, folder));
        });

        log('\n📁 Example folders created in images-source/', 'green');
        log('Add your PNG files to these folders and run this script again.\n', 'cyan');
        return [];
    }

    return fs.readdirSync(dirPath)
        .filter(item => {
            const itemPath = path.join(dirPath, item);
            return fs.statSync(itemPath).isDirectory();
        })
        .filter(folder => !folder.startsWith('.'));
}

function countImages(folderPath) {
    return getImageFilesRecursive(folderPath).length;
}

function getImageFilesRecursive(folderPath, baseFolder = folderPath) {
    if (!fs.existsSync(folderPath)) {
        return [];
    }

    let images = [];
    const items = fs.readdirSync(folderPath);

    items.forEach(item => {
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            // Recursively search subdirectories
            images = images.concat(getImageFilesRecursive(itemPath, baseFolder));
        } else if (stat.isFile() && /\.(png|jpg|jpeg)$/i.test(item)) {
            // Get relative path from base folder and remove extension
            const relativePath = path.relative(baseFolder, itemPath);
            const imageName = relativePath.replace(/\.(png|jpg|jpeg)$/i, '').replace(/\\/g, '/');
            images.push(imageName);
        }
    });

    return images;
}

function getImageFiles(folderPath) {
    return getImageFilesRecursive(folderPath);
}

function generateManifest(folders) {
    const manifest = { atlases: {}, images: {} };

    // Scan generated atlas files to determine which atlases exist
    const generatedAtlases = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith('.json') && f !== 'manifest.json')
        .map(f => path.basename(f, '.json'));

    folders.forEach(folder => {
        const folderPath = path.join(SOURCE_DIR, folder);
        const images = getImageFiles(folderPath);

        if (images.length === 0) {
            return;
        }

        // Find all atlases for this folder (folder or folder-1, folder-2, etc.)
        const folderAtlases = generatedAtlases.filter(atlas =>
            atlas === folder || atlas.match(new RegExp(`^${folder}-\\d+$`))
        );

        if (folderAtlases.length > 0) {
            manifest.atlases[folder] = folderAtlases;
            manifest.images[folder] = images;
        }
    });

    return manifest;
}

function saveManifest(manifest) {
    try {
        const manifestJson = JSON.stringify(manifest, null, 2);
        fs.writeFileSync(MANIFEST_PATH, manifestJson, 'utf8');
        log(`✓ Generated manifest: ${MANIFEST_PATH}`, 'green');
        log(`  Folders: ${Object.keys(manifest).length}, Total images: ${Object.values(manifest).flat().length}`, 'cyan');
    } catch (error) {
        log(`✗ Failed to save manifest: ${error.message}`, 'red');
    }
}

function getAllPngFiles(folderPath, baseFolder = folderPath) {
    if (!fs.existsSync(folderPath)) {
        return [];
    }

    let pngFiles = [];
    const items = fs.readdirSync(folderPath);

    items.forEach(item => {
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            // Recursively search subdirectories
            pngFiles = pngFiles.concat(getAllPngFiles(itemPath, baseFolder));
        } else if (stat.isFile() && /\.(png|jpg|jpeg)$/i.test(item)) {
            // Add absolute path with forward slashes for TexturePacker
            pngFiles.push(itemPath.replace(/\\/g, '/'));
        }
    });

    return pngFiles;
}

function buildTexturePackerCommand(fileList, outputName, licenseKey) {
    const outputPath = path.join(OUTPUT_DIR, outputName);

    // Create a temporary flat directory for this batch
    const tempDir = path.join(OUTPUT_DIR, `_temp_${outputName}`);
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    // Copy files to temp directory
    fileList.forEach((file, idx) => {
        const fileName = path.basename(file);
        const destPath = path.join(tempDir, fileName);
        fs.copyFileSync(file.replace(/\//g, path.sep), destPath);
    });

    let command = 'TexturePacker';

    // Add settings
    command += ` --format ${TEXTUREPACKER_SETTINGS.format}`;
    command += ` --algorithm ${TEXTUREPACKER_SETTINGS.algorithm}`;
    command += ` --padding ${TEXTUREPACKER_SETTINGS.padding}`;
    command += ` --extrude ${TEXTUREPACKER_SETTINGS.extrude}`;
    command += ` --max-width ${TEXTUREPACKER_SETTINGS.maxWidth}`;
    command += ` --max-height ${TEXTUREPACKER_SETTINGS.maxHeight}`;
    command += ` --trim-mode ${TEXTUREPACKER_SETTINGS.trimMode}`;
    command += ` --scale ${TEXTUREPACKER_SETTINGS.scale}`;

    if (!TEXTUREPACKER_SETTINGS.allowRotation) {
        command += ' --disable-rotation';
    }

    if (!TEXTUREPACKER_SETTINGS.premultiplyAlpha) {
        command += ' --disable-auto-alias';
    }

    // Add license key if available
    if (licenseKey) {
        command += ` --license-key "${licenseKey}"`;
    }

    // Add input/output paths
    command += ` --sheet "${outputPath}.png"`;
    command += ` --data "${outputPath}.json"`;

    // Add each PNG file from temp directory explicitly
    const tempFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.png'));
    tempFiles.forEach(file => {
        command += ` "${path.join(tempDir, file).replace(/\\/g, '/')}"`;
    });

    return { command, tempDir };
}

function processFolderWithBatching(folder, folderIndex, totalFolders, licenseKey) {
    const folderPath = path.join(SOURCE_DIR, folder);
    const allFiles = getAllPngFiles(folderPath);

    if (allFiles.length === 0) {
        log(`⊘ Skipping "${folder}" (no images found)`, 'yellow');
        return { successCount: 0, failCount: 0 };
    }

    const totalFiles = allFiles.length;
    const needsBatching = totalFiles > MAX_FILES_PER_ATLAS;
    const batchCount = needsBatching ? Math.ceil(totalFiles / MAX_FILES_PER_ATLAS) : 1;

    log(`[${folderIndex + 1}/${totalFolders}] Processing "${folder}" (${totalFiles} images${needsBatching ? `, splitting into ${batchCount} atlases` : ''})...`, 'cyan');

    let successCount = 0;
    let failCount = 0;

    for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
        const start = batchIndex * MAX_FILES_PER_ATLAS;
        const end = Math.min(start + MAX_FILES_PER_ATLAS, totalFiles);
        const batchFiles = allFiles.slice(start, end);
        const batchName = needsBatching ? `${folder}-${batchIndex + 1}` : folder;

        let tempDir = null;

        try {
            const { command, tempDir: tempFolder } = buildTexturePackerCommand(batchFiles, batchName, licenseKey);
            tempDir = tempFolder;

            // Execute TexturePacker
            execSync(command, { stdio: 'pipe' });

            const outputFile = path.join(OUTPUT_DIR, `${batchName}.json`);
            if (fs.existsSync(outputFile)) {
                const stats = fs.statSync(outputFile);
                const fileSize = (stats.size / 1024).toFixed(2);
                const batchInfo = needsBatching ? ` (batch ${batchIndex + 1}/${batchCount}, ${batchFiles.length} images)` : '';
                log(`  ✓ Generated atlas: ${batchName}.json (${fileSize} KB)${batchInfo}`, 'green');
                successCount++;
            } else {
                throw new Error('Output file not created');
            }
        } catch (error) {
            log(`  ✗ Failed to process "${batchName}"`, 'red');
            if (error.message) {
                log(`    Error: ${error.message}`, 'red');
            }
            failCount++;
        } finally {
            // Clean up temporary directory
            if (tempDir && fs.existsSync(tempDir)) {
                try {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                } catch (cleanupError) {
                    // Ignore cleanup errors
                }
            }
        }
    }

    log('');
    return { successCount, failCount };
}

function packTextures() {
    log('\n' + '='.repeat(60), 'bright');
    log('  TexturePacker Automation for Phaser 3', 'bright');
    log('='.repeat(60) + '\n', 'bright');

    // Check if TexturePacker CLI is available
    if (!checkTexturePackerCLI()) {
        log('✗ TexturePacker CLI not found!', 'red');
        log('\nPlease install TexturePacker CLI:', 'yellow');
        log('  Download from: https://www.codeandweb.com/texturepacker', 'cyan');
        log('  Make sure TexturePacker is added to your system PATH\n', 'cyan');
        process.exit(1);
    }

    log('✓ TexturePacker CLI found', 'green');

    // Check for license key
    const licenseKey = checkLicenseKey();

    // Ensure output directory exists
    ensureDirectoryExists(OUTPUT_DIR);

    // Get all subfolders in source directory
    const folders = getSubfolders(SOURCE_DIR);

    if (folders.length === 0) {
        log('No folders found to process.', 'yellow');
        process.exit(0);
    }

    log(`\nFound ${folders.length} folder(s) to process:\n`, 'bright');

    let successCount = 0;
    let failCount = 0;
    const results = [];

    // Process each folder
    folders.forEach((folder, index) => {
        const result = processFolderWithBatching(folder, index, folders.length, licenseKey);
        successCount += result.successCount;
        failCount += result.failCount;
    });

    // Generate manifest file with all folders and their images
    log('Generating asset manifest...', 'cyan');
    const manifest = generateManifest(folders);
    saveManifest(manifest);
    log('');

    // Summary
    log('='.repeat(60), 'bright');
    log('  Summary', 'bright');
    log('='.repeat(60) + '\n', 'bright');

    log(`Total folders processed: ${folders.length}`, 'cyan');
    log(`Successful: ${successCount}`, 'green');
    if (failCount > 0) {
        log(`Failed: ${failCount}`, 'red');
    }

    if (successCount > 0) {
        log('\n✓ Texture atlases generated successfully!', 'green');
        log(`  Output directory: ${OUTPUT_DIR}\n`, 'cyan');
    }

    if (!licenseKey && successCount > 0) {
        log('⚠️  Remember: Atlases may contain watermarks without a license key!', 'yellow');
        log('   Set TEXTUREPACKER_LICENSE environment variable to remove watermarks.\n', 'yellow');
    }
}

// Run the packing process
try {
    packTextures();
} catch (error) {
    log(`\n✗ Unexpected error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
}
