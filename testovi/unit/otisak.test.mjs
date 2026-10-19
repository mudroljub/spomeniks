import {test} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {proveriOtisak} from '../../alati/otisak.mjs'

test('otisak resursa otkriva promenu i ignorise razliku LF/CRLF', () => {
  const direktorijum = mkdtempSync(join(tmpdir(), 'otisak-'))
  try {
    const root = pathToFileURL(direktorijum + '/')
    const worker = "const VERZIJA = ''; const fajlovi=['main.js'];"
    writeFileSync(join(direktorijum,'sw.js'),worker)
    writeFileSync(join(direktorijum,'main.js'),'prvo\n')
    const {ocekivana} = proveriOtisak(root)
    writeFileSync(join(direktorijum,'sw.js'),worker.replace("VERZIJA = ''",`VERZIJA = '${ocekivana}'`))
    assert.equal(proveriOtisak(root).ispravno,true)
    writeFileSync(join(direktorijum,'main.js'),'prvo\r\n')
    assert.equal(proveriOtisak(root).ispravno,true)
    writeFileSync(join(direktorijum,'main.js'),'drugo\n')
    assert.equal(proveriOtisak(root).ispravno,false)
  } finally {rmSync(direktorijum,{recursive:true,force:true})}
})
